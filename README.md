# 🧱 GOD MODE Smart Contracts


##  🔧 Setting up Local Development
Required: 
- [Node v14](https://nodejs.org/download/release/latest-v14.x/)  
- [Git](https://git-scm.com/downloads)


Local Setup Steps:
1. git clone https://github.com/OlympusDAO/olympus-contracts.git 
1. Install dependencies: `npm install` 
    - Installs [Hardhat](https://hardhat.org/getting-started/) & [OpenZepplin](https://docs.openzeppelin.com/contracts/4.x/) dependencies
1. Compile Solidity: `npm run compile`
1. **_TODO_**: How to do local deployments of the contracts.


## 🤨 How it all works
![High Level Contract Interactions](./docs/box-diagram.png)

## FTM Testnet Contracts & Addresses

- BRICK 0x80FAcC2c14E6F1B31A952C43264b333C2788f30f
- Mock FRAX 0x9e008Cc93b4D2179dB48Fe5A0fed6B484aFf1739
- Mock WFTM 0x0Ae825CD631d5b59D56ACc635f1599ebb3390A6d
- BondingCalculator 0x17FC72CA16208b085613B0CA120914c8D546A764
- Treasury 0xe8e51612b1606c410E1240b80A5b3F2046ce7006
- Distributor 0xf0424efD7295e0b81f143cA23eFBA3b476ed9C1e
- sBRICK 0x9f6fBD3ac94BA9c823c43F2Ae0dcA80A4783e3b5
- Staking 0x6137c9684283D515DE179cb897a5d0345C61488F
- StakingWarmup 0xB8408Fc5f5aE1980a6af4CaA6118E98F7c328A5d
- StakingHelper 0x2663a2E5f4DF96b79377DA6B15e448b012838Cb8
- FraxBondDepository 0x38E4560A1DB2DAe89F78F98b308eE6F890b27712
- WftmBondDepository 0x1e0AD0F8DDFF84FDc938373E9aa66b8d994ea066

|Contract       | Addresss                                                                                                            | Notes   |
|:-------------:|:-------------------------------------------------------------------------------------------------------------------:|-------|
|fBRICK            |[0x80FAcC2c14E6F1B31A952C43264b333C2788f30f](https://testnet.ftmscan.com/address/0x80FAcC2c14E6F1B31A952C43264b333C2788f30f)| Main Token Contract|
|spBRICK           |[0x9f6fBD3ac94BA9c823c43F2Ae0dcA80A4783e3b5](https://testnet.ftmscan.com/address/0x9f6fBD3ac94BA9c823c43F2Ae0dcA80A4783e3b5)| Staked fOHM|
|Treasury       |[0xe8e51612b1606c410E1240b80A5b3F2046ce7006](https://testnet.ftmscan.com/address/0xe8e51612b1606c410E1240b80A5b3F2046ce7006)| Olympus Treasury holds all the assets        |
|OlympusStaking |[0x6137c9684283D515DE179cb897a5d0345C61488F](https://etherscan.io/address/0x6137c9684283D515DE179cb897a5d0345C61488F)| Main Staking contract responsible for calling rebases every 2200 blocks|
|StakingHelper  |[0x2663a2E5f4DF96b79377DA6B15e448b012838Cb8](https://etherscan.io/address/0x2663a2E5f4DF96b79377DA6B15e448b012838Cb8)| Helper Contract to Stake with 0 warmup |
|DAO            |[](https://etherscan.io/address/)|Storage Wallet for DAO under MS |
|Staking Warm Up|[0xB8408Fc5f5aE1980a6af4CaA6118E98F7c328A5d](https://etherscan.io/address/0x2882A5CD82AC49e06620382660f5ed932607c5f1)| Instructs the Staking contract when a user can claim sOHM |


**Bonds**
- **_TODO_**: What are the requirements for creating a Bond Contract?
All LP bonds use the Bonding Calculator contract which is used to compute RFV. 

|Contract       | Addresses                                                                                                            | Notes   |
|:-------------:|:-------------------------------------------------------------------------------------------------------------------:|-------|
|Bond Calculator|[0xcaaA6a2d4B26067a391E7B7D65C16bb2d5FA571A](https://etherscan.io/address/0xcaaA6a2d4B26067a391E7B7D65C16bb2d5FA571A)| |
|DAI bond|[0x575409F8d77c12B05feD8B455815f0e54797381c](https://etherscan.io/address/0x575409F8d77c12B05feD8B455815f0e54797381c)| Main bond managing serve mechanics for OHM/DAI|
|DAI/OHM SLP Bond|[0x956c43998316b6a2F21f89a1539f73fB5B78c151](https://etherscan.io/address/0x956c43998316b6a2F21f89a1539f73fB5B78c151)| Manages mechanism for the protocol to buy back its own liquidity from the pair. |
|FRAX Bond|[0x8510c8c2B6891E04864fa196693D44E6B6ec2514](https://etherscan.io/address/0x8510c8c2B6891E04864fa196693D44E6B6ec2514)|Similar to DAI bond but using FRAX|
|FRAX/OHM SLP Bond|[0xc20CffF07076858a7e642E396180EC390E5A02f7](https://etherscan.io/address/0xc20CffF07076858a7e642E396180EC390E5A02f7)| Similar to DAI/OHM but using FRAX |

**OLD Contracts**:

- sOHM: 0x31932e6e45012476ba3a3a4953cba62aee77fbbe 
- Vault: 0x886ce997aa9ee4f8c2282e182ab72a705762399d 
- Staking (v1): 0x0822f3c03dcc24d200aff33493dc08d0e1f274a2


### Testnet Addresses

Network: `Rinkeby` (4)
- OHM: `0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932`
- DAI: `0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C` 
- Frax: `0x2F7249cb599139e560f0c81c269Ab9b04799E453`
- Treasury: `0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7`
- OHM/DAI Pair: `0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2`
- OHM/Frax Pair: `0x11BE404d7853BDE29A3e73237c952EcDCbBA031E`
- Calc: `0xaDBE4FA3c2fcf36412D618AfCfC519C869400CEB` 
- Staking: `0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2` 
- sOHM: `0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084` 
- Distributor `0x0626D5aD2a230E05Fb94DF035Abbd97F2f839C3a` 
- Staking Warmup `0x43B18Ad2624DBEf474aA8E0c8d8404a0A42b7aC4` 
- Staking Helper `0xf73f23Bb0edCf4719b12ccEa8638355BF33604A1`


## Allocator Guide

The following is a guide for interacting with the treasury as a reserve allocator.

A reserve allocator is a contract that deploys funds into external strategies, such as Aave, Curve, etc.

Treasury Address: `0x31F8Cc382c9898b273eff4e0b7626a6987C846E8`

**Managing**:
The first step is withdraw funds from the treasury via the "manage" function. "Manage" allows an approved address to withdraw excess reserves from the treasury.

*Note*: This contract must have the "reserve manager" permission, and that withdrawn reserves decrease the treasury's ability to mint new OHM (since backing has been removed).

Pass in the token address and the amount to manage. The token will be sent to the contract calling the function.

```
function manage( address _token, uint _amount ) external;
```

Managing treasury assets should look something like this:
```
treasury.manage( DAI, amountToManage );
```

**Returning**:
The second step is to return funds after the strategy has been closed.
We utilize the `deposit` function to do this. Deposit allows an approved contract to deposit reserve assets into the treasury, and mint OHM against them. In this case however, we will NOT mint any OHM. This will be explained shortly.

*Note* The contract must have the "reserve depositor" permission, and that deposited reserves increase the treasury's ability to mint new OHM (since backing has been added).


Pass in the address sending the funds (most likely the allocator contract), the amount to deposit, and the address of the token. The final parameter, profit, dictates how much OHM to send. send_, the amount of OHM to send, equals the value of amount minus profit.
```
function deposit( address _from, uint _amount, address _token, uint _profit ) external returns ( uint send_ );
```

To ensure no OHM is minted, we first get the value of the asset, and pass that in as profit.
Pass in the token address and amount to get the treasury value.
```
function valueOf( address _token, uint _amount ) public view returns ( uint value_ );
```

All together, returning funds should look something like this:
```
treasury.deposit( address(this), amountToReturn, DAI, treasury.valueOf( DAI, amountToReturn ) );
```
