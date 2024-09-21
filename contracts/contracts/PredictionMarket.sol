// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMACI {
    struct Pubkey {
        uint256 x;
        uint256 y;
    }
    struct TreeDepths 
    {
        uint256 intStateTreeDepth;
        uint256 messageTreeSubDepth;
        uint256 messageTreeDepth;
        uint256 voteOptionTreeDepth;
    }
    function deployPoll(
        uint256 _pollDuration,
        TreeDepths memory treeDepths,
        Pubkey memory _coordinatorPubkey,
        address _verifierContractAddress,
        address _vkRegistryContractAddress,
        bool _mode
    ) external returns (address pollContractAddress, address messageProcessorContractAddress, address tallyContractAddress);

     function signup(Pubkey memory _userpubkey, bytes memory _signUpGatekeeperData, bytes memory _initialVoiceCreditProxyData) external;
}

contract PredictionMarket {
    address public maciContractAddress;
    address public platformOwner;
    uint256 public marketCount;
    uint256 public challengePeriod = 5 days;
    uint256 public lockInPeriod = 7 days;
    uint256 public platformFeePercentage = 2; // 2% platform fee
    uint256 public ownerFeeSharePercentage = 20; // 20% of the platform fee goes to the market owner
    uint256 public curatorFeePercentage = 5; 

    struct Secrets {
        string sharedSecret;
        string publicKey;
    }
    struct Pubkey {
        uint256 x;
        uint256 y;
    }

    mapping(uint256 => Secrets) private sharedSecret;

    enum MarketOutcome {
        NotResolved,
        Yes,
        No
    }

    struct Market {
        uint256 id;
        address owner;
        string question;
        uint256 totalYesVotes;
        uint256 totalNoVotes;
        uint256 totalWinnings;
        bytes[] encryptedVotes;
        MarketOutcome outcome;
        uint256 endDate;
        uint256 resolvedAt;
        bool challenged;
        mapping(address => uint256) userVotes;
        mapping(address => uint256) userWinnings;

    }

    mapping(uint256 => Market) public markets;
    mapping(address => uint256) public userVoteCounts; 
    mapping(address => uint256) public userTotalWinnings;
    mapping(address => bool) public worldcoinVerified;

    event MarketCreated(uint256 indexed id, string question, uint256 endDate);
    event VotesBought(uint256 indexed id, address indexed buyer, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed id, MarketOutcome outcome);
    event MarketChallenged(uint256 indexed id, MarketOutcome proposedOutcome);
    event WinningsClaimed(uint256 indexed id, address indexed claimer, uint256 amount);



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

    modifier onlyMarketOwner(uint256 _marketId) {
        require(msg.sender == markets[_marketId].owner, "Only the market owner can call this function");
        _;
    }

    modifier hasVotedIn3Markets(address user) {
        require(userVoteCounts[user] >= 3, "User must have voted in at least 3 markets to create a market");
        _;
    }

    modifier isWorldcoinVerified(address user) {
        require(worldcoinVerified[user], "User is not verified with Worldcoin");
        _;
    }

    constructor(address _maciContractAddress) {
        platformOwner = msg.sender;
        marketCount = 0;
        maciContractAddress = _maciContractAddress;
    }

    function setVoteCountForTest(address user, uint256 voteCount) public {
    require(voteCount <= 3, "Can only set up to 3 votes for testing");
        userVoteCounts[user] = 4;
    }

    function setWorldcoinVerified(address _user, bool _status) external onlyPlatformOwner {
        worldcoinVerified[_user] = _status;
    }

    function registerWithMACI(Pubkey memory _pubkey) external {
        IMACI maci = IMACI(maciContractAddress);
        IMACI.Pubkey memory maciUserPubKey = IMACI.Pubkey({
            // _coordinatorPubKey.x
            x: 3023308648992852725595019790422607702317012588557935138001276188894784124188,
            y: 15170407648900426833379661346620655554840178802737890165845364870025680060864
        });
        maci.signup(maciUserPubKey,'0x','0x');
        emit RegisteredWithMACI(msg.sender);
    }

    function createMarket(
        string memory _question,
        string memory _publicKey,
        string memory _sharedSecret,
        Pubkey memory _coordinatorPubKey,
        uint256 _endDate
    ) external hasVotedIn3Markets(msg.sender) isWorldcoinVerified(msg.sender) {
        require(_endDate > block.timestamp, "End date must be in the future");

        marketCount++;
        Market storage newMarket = markets[marketCount];
        newMarket.id = marketCount;
        newMarket.owner = msg.sender;
        newMarket.question = _question;
        newMarket.outcome = MarketOutcome.NotResolved;
        newMarket.endDate = _endDate;




        emit MarketCreated(marketCount, _question, _endDate);

    }

    function buyVotes(
        uint256 _marketId,
        bool _prediction,
        bytes calldata _encryptedVote
    ) external payable marketExists(_marketId) marketNotResolved(_marketId) isWorldcoinVerified(msg.sender) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(block.timestamp < markets[_marketId].endDate, "Voting period has ended");

        Market storage market = markets[_marketId];
        address buyer = msg.sender;

        if (_prediction) {
            market.totalYesVotes += msg.value;
        } else {
            market.totalNoVotes += msg.value;
        }

        market.encryptedVotes.push(_encryptedVote);
        market.userVotes[buyer] += msg.value;

        // Increment global vote count
        if (market.userVotes[buyer] == msg.value) {
            userVoteCounts[buyer]++;
        }

            emit VotesBought(_marketId, buyer, msg.value, _prediction);
    }

    function resolveMarket(
        uint256 _marketId,
        bool _outcome
    ) external onlyMarketOwner(_marketId) marketExists(_marketId) marketNotResolved(_marketId) isWorldcoinVerified(msg.sender) {
        require(block.timestamp > markets[_marketId].endDate, "Cannot resolve market before end date");

        Market storage market = markets[_marketId];
        market.resolvedAt = block.timestamp;
        market.totalWinnings = market.totalNoVotes + market.totalYesVotes;

        if (_outcome) {
            market.outcome = MarketOutcome.Yes;
        } else {
            market.outcome = MarketOutcome.No;
        }

        emit MarketResolved(_marketId, market.outcome);
    }





    function claimWinnings(uint256 _marketId) external marketExists(_marketId) isWorldcoinVerified(msg.sender) {
        Market storage market = markets[_marketId];
        require(market.outcome != MarketOutcome.NotResolved, "Market not yet resolved");
        require(block.timestamp > market.resolvedAt + lockInPeriod, "Lock-in period has not ended");
        require(!market.challenged || (market.curatorYesVotes > market.curatorNoVotes), "Challenges unresolved");

        address claimer = msg.sender;
        uint256 userContribution = market.userVotes[claimer];
        require(userContribution > 0, "No votes placed by user");

        require(!market.userWinningsClaimed[claimer], "Winnings already claimed by this user");

        uint256 winnings = (userContribution * market.totalWinnings) / (market.totalYesVotes + market.totalNoVotes);

        // Calculate the platform fee and the owner's share
        uint256 platformFee = (winnings * platformFeePercentage) / 100;
        uint256 ownerFee = (platformFee * ownerFeeSharePercentage) / 100;
        uint256 finalWinnings = winnings - platformFee;

        (bool success, ) = claimer.call{value: finalWinnings}("");
        require(success, "Failed to send winnings");

        emit WinningsClaimed(_marketId, claimer, finalWinnings);
    }

}