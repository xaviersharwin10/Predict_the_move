// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    address public platformOwner;
    uint256 public marketCount;

    struct Market {
        address owner;
        string question;
        uint256 totalYesVotes;
        uint256 totalNoVotes;
        uint256 resolvedAt;
        uint256 endDate;
        MarketOutcome outcome;
        bool challenged;
        uint256 curatorYesVotes;
        uint256 curatorNoVotes;
        bool ownerFeeClaimed;
    }

    enum MarketOutcome { NotResolved, Yes, No }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public userVotes;
    mapping(uint256 => mapping(address => uint256)) public userWinnings;
    mapping(uint256 => mapping(address => bool)) public userWinningsClaimed;
    mapping(uint256 => mapping(address => bool)) public curatorVotes;
    mapping(uint256 => mapping(address => bool)) public curatorFeeClaimed;
    mapping(uint256 => address[]) public curatorAddresses;
    mapping(address => uint256) public userVoteCounts;
    mapping(address => uint256) public userTotalWinnings;
    mapping(address => bool) public worldcoinVerified;

    uint256 public constant CHALLENGE_PERIOD = 5 days;
    uint256 public constant LOCK_IN_PERIOD = 7 days;
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 2;
    uint256 public constant OWNER_FEE_SHARE_PERCENTAGE = 20;
    uint256 public constant CURATOR_FEE_PERCENTAGE = 5;

    event MarketCreated(uint256 indexed id, string question, uint256 endDate);
    event VotesBought(uint256 indexed id, address indexed buyer, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed id, MarketOutcome outcome);
    event MarketChallenged(uint256 indexed id, MarketOutcome proposedOutcome);
    event WinningsClaimed(uint256 indexed id, address indexed claimer, uint256 amount);
    event CuratorFeeClaimed(uint256 indexed id, address curator, uint256 curatorShare);

    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only the platform owner can call this function");
        _;
    }

    modifier marketExists(uint256 _marketId) {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        _;
    }

    modifier marketNotResolved(uint256 _marketId) {
        require(markets[_marketId].outcome == MarketOutcome.NotResolved, "Market already resolved");
        _;
    }

    modifier isWorldcoinVerified() {
        require(worldcoinVerified[msg.sender], "User is not verified with Worldcoin");
        _;
    }

    constructor() {
        platformOwner = msg.sender;
    }

    function setWorldcoinVerified(address _user, bool _status) external onlyPlatformOwner {
        worldcoinVerified[_user] = _status;
    }

    function createMarket(string memory _question, uint256 _endDate) public{
        require(_endDate > block.timestamp, "End date must be in the future");
        marketCount++;
        markets[marketCount] = Market({
            owner: msg.sender, 
            question: _question,
            totalYesVotes: 0,
            totalNoVotes: 0,
            resolvedAt: 0,
            endDate: _endDate,
            outcome: MarketOutcome.NotResolved,
            challenged: false,
            curatorYesVotes: 0,
            curatorNoVotes: 0,
            ownerFeeClaimed: false
        });
        emit MarketCreated(marketCount, _question, _endDate);
    }

    function buyVotes(uint256 _marketId, bool _prediction) external payable marketExists(_marketId) marketNotResolved(_marketId) isWorldcoinVerified {
        require(msg.value > 0, "Amount must be greater than 0");
        require(block.timestamp < markets[_marketId].endDate, "Voting period has ended");

        Market storage market = markets[_marketId];
        if (_prediction) {
            market.totalYesVotes += msg.value;
        } else {
            market.totalNoVotes += msg.value;
        }

        userVotes[_marketId][msg.sender] += msg.value;

        if (userVotes[_marketId][msg.sender] == msg.value) {
            userVoteCounts[msg.sender]++;
        }

        emit VotesBought(_marketId, msg.sender, msg.value, _prediction);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external marketExists(_marketId) marketNotResolved(_marketId) isWorldcoinVerified {
        Market storage market = markets[_marketId];
        require(msg.sender == market.owner, "Only the market owner can call this function");
        require(block.timestamp > market.endDate, "Cannot resolve market before end date");

        market.resolvedAt = block.timestamp;
        market.outcome = _outcome ? MarketOutcome.Yes : MarketOutcome.No;

        emit MarketResolved(_marketId, market.outcome);
    }

    function challengeMarketOutcome(uint256 _marketId) external marketExists(_marketId) isWorldcoinVerified {
        Market storage market = markets[_marketId];
        require(block.timestamp <= market.resolvedAt + CHALLENGE_PERIOD, "Challenge period has expired");
        require(market.outcome != MarketOutcome.NotResolved, "Market must be resolved to challenge");
        market.challenged = true;
        emit MarketChallenged(_marketId, market.outcome);
    }

    function curatorVoteOnOutcome(uint256 _marketId, bool _agreeWithOutcome) external marketExists(_marketId) isWorldcoinVerified {
        Market storage market = markets[_marketId];
        require(market.challenged, "Market has not been challenged");
        require(!curatorVotes[_marketId][msg.sender], "You have already voted as a curator");

        if (_agreeWithOutcome) {
            market.curatorYesVotes++;
        } else {
            market.curatorNoVotes++;
        }

        curatorVotes[_marketId][msg.sender] = true;
        curatorAddresses[_marketId].push(msg.sender);

        uint256 totalVotes = market.curatorYesVotes + market.curatorNoVotes;
        if (market.curatorYesVotes > totalVotes / 2) {
            market.outcome = MarketOutcome.Yes;
        } else if (market.curatorNoVotes > totalVotes / 2) {
            market.outcome = MarketOutcome.No;
        }
    }

    function claimWinnings(uint256 _marketId) external marketExists(_marketId) isWorldcoinVerified {
        Market storage market = markets[_marketId];
        require(market.outcome != MarketOutcome.NotResolved, "Market not yet resolved");
        require(block.timestamp > market.resolvedAt + LOCK_IN_PERIOD, "Lock-in period has not ended");
        require(!market.challenged || (market.curatorYesVotes > market.curatorNoVotes), "Challenges unresolved");

        uint256 userVote = userVotes[_marketId][msg.sender];
        require(userVote > 0, "No votes placed by user");
        require(!userWinningsClaimed[_marketId][msg.sender], "Winnings already claimed by this user");

        uint256 totalVotes = market.totalYesVotes + market.totalNoVotes;
        uint256 winningVotes = (market.outcome == MarketOutcome.Yes) ? market.totalYesVotes : market.totalNoVotes;
        uint256 winnings = (userVote * totalVotes) / winningVotes;

        uint256 platformFee = (winnings * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 ownerFee = (platformFee * OWNER_FEE_SHARE_PERCENTAGE) / 100;
        uint256 finalWinnings = winnings - platformFee;

        if (!market.ownerFeeClaimed) {
            (bool ownerSuccess, ) = market.owner.call{value: ownerFee}("");
            require(ownerSuccess, "Failed to send owner's fee");
            market.ownerFeeClaimed = true;
        }
        
        (bool success, ) = msg.sender.call{value: finalWinnings}("");
        require(success, "Failed to send winnings");
        
        userTotalWinnings[msg.sender] += finalWinnings;
        userWinningsClaimed[_marketId][msg.sender] = true;
        
        emit WinningsClaimed(_marketId, msg.sender, finalWinnings);
    }

    function claimCuratorFee(uint256 _marketId) external marketExists(_marketId) {
        Market storage market = markets[_marketId];
        require(market.outcome != MarketOutcome.NotResolved, "Market not yet resolved");
        require(block.timestamp > market.resolvedAt + LOCK_IN_PERIOD, "Lock-in period has not ended");
        require(!market.challenged || (market.curatorYesVotes > market.curatorNoVotes), "Challenges unresolved");
        require(curatorVotes[_marketId][msg.sender], "Not a curator for this market");
        require(!curatorFeeClaimed[_marketId][msg.sender], "Curator fee already claimed");

        uint256 totalVotes = market.totalYesVotes + market.totalNoVotes;
        uint256 curatorFee = (totalVotes * CURATOR_FEE_PERCENTAGE) / 100;
        uint256 curatorShare = curatorFee / (market.curatorYesVotes + market.curatorNoVotes);

        (bool success, ) = msg.sender.call{value: curatorShare}("");
        require(success, "Failed to send curator fee");

        curatorFeeClaimed[_marketId][msg.sender] = true;

        emit CuratorFeeClaimed(_marketId, msg.sender, curatorShare);
    }

    function getCuratorAddresses(uint256 _marketId) external view returns (address[] memory) {
        return curatorAddresses[_marketId];
    }
}