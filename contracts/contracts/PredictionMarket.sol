
pragma solidity ^0.8.0;

contract PredictionMarket {
  uint256 public marketCount;

  enum Outcome {
    Unresolved,
    Yes,
    No
  }

  struct Market {
    address owner;
    string question;
    uint256 totalYesStake;
    uint256 totalNoStake;
    uint256 endDate;
    Outcome outcome;
    mapping(address => uint256) userStake;
    mapping(address => bool) userVotedYes;
  }

  mapping(uint256 => Market) public markets;

  // Reduced to one event for significant state changes
  event MarketStateChanged(uint256 indexed id, string action);

  function createMarket(string memory _question, uint256 _endDate) external {
    require(_endDate > block.timestamp, "End date must be in the future");

    marketCount++;
    Market storage newMarket = markets[marketCount];
    newMarket.owner = msg.sender;
    newMarket.question = _question;
    newMarket.endDate = _endDate;

    emit MarketStateChanged(marketCount, "Created");
  }

  function placeStake(uint256 _marketId, bool _prediction) external payable {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
    require(msg.value > 0, "Stake must be greater than 0");

    Market storage market = markets[_marketId];
    require(block.timestamp < market.endDate, "Market has ended");
    require(market.outcome == Outcome.Unresolved, "Market already resolved");

    if (_prediction) {
      market.totalYesStake += msg.value;
    } else {
      market.totalNoStake += msg.value;
    }

    market.userStake[msg.sender] += msg.value;
    market.userVotedYes[msg.sender] = _prediction;

    emit MarketStateChanged(_marketId, "StakePlaced");
  }

  function resolveMarket(uint256 _marketId, bool _outcome) external {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");

    Market storage market = markets[_marketId];
    require(msg.sender == market.owner, "Only the market owner can resolve");
    require(
      block.timestamp > market.endDate,
      "Cannot resolve market before end date"
    );
    require(market.outcome == Outcome.Unresolved, "Market already resolved");

    market.outcome = _outcome ? Outcome.Yes : Outcome.No;

    emit MarketStateChanged(_marketId, "Resolved");
  }

  function claimWinnings(uint256 _marketId) external {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");

    Market storage market = markets[_marketId];
    require(market.outcome != Outcome.Unresolved, "Market not yet resolved");

    address claimer = msg.sender;
    uint256 userStake = market.userStake[claimer];
    require(userStake > 0, "No stake made by user");

    bool userWon = (market.outcome == Outcome.Yes &&
      market.userVotedYes[claimer]) ||
      (market.outcome == Outcome.No && !market.userVotedYes[claimer]);
    require(userWon, "User did not stake on the winning outcome");

    uint256 winningPool = (market.outcome == Outcome.Yes)
      ? market.totalYesStake
      : market.totalNoStake;
    uint256 winnings = (userStake *
      (market.totalYesStake + market.totalNoStake)) / winningPool;

    market.userStake[claimer] = 0;
    (bool success, ) = claimer.call{value: winnings}("");
    require(success, "Failed to send winnings");

    emit MarketStateChanged(_marketId, "WinningsClaimed");
  }

  // New view functions
  function getMarketDetails(
    uint256 _marketId
  )
    external
    view
    returns (
      address owner,
      string memory question,
      uint256 totalYesStake,
      uint256 totalNoStake,
      uint256 endDate,
      Outcome outcome
    )
  {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
    Market storage market = markets[_marketId];
    return (
      market.owner,
      market.question,
      market.totalYesStake,
      market.totalNoStake,
      market.endDate,
      market.outcome
    );
  }

  function getUserStake(
    uint256 _marketId,
    address _user
  ) external view returns (uint256 stake, bool votedYes) {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
    Market storage market = markets[_marketId];
    return (market.userStake[_user], market.userVotedYes[_user]);
  }

  function getMarketOutcome(uint256 _marketId) external view returns (Outcome) {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
    return markets[_marketId].outcome;
  }

  function calculateWinnings(
    uint256 _marketId,
    address _user
  ) external view returns (uint256) {
    require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
    Market storage market = markets[_marketId];
    require(market.outcome != Outcome.Unresolved, "Market not yet resolved");

    uint256 userStake = market.userStake[_user];
    if (userStake == 0) return 0;

    bool userWon = (market.outcome == Outcome.Yes &&
      market.userVotedYes[_user]) ||
      (market.outcome == Outcome.No && !market.userVotedYes[_user]);
    if (!userWon) return 0;

    uint256 winningPool = (market.outcome == Outcome.Yes)
      ? market.totalYesStake
      : market.totalNoStake;
    return
      (userStake * (market.totalYesStake + market.totalNoStake)) / winningPool;
  }
}