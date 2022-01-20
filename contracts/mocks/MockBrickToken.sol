pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBrickToken is ERC20 {
    constructor() ERC20("BrickToken", "BRK") {
        _mint(msg.sender, 10000000 ether);
    }

    function mint() external {
        _mint(msg.sender, 10000 ether);
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }
}
