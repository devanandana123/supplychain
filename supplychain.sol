// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    enum Status { Produced, InTransit, Sold }
    
    struct Product {
        uint id;
        string name;
        string origin;
        Status status;
        address owner;
        uint price;
    }

    mapping(uint => Product) public products;
    mapping(uint => bool) public productExists;
    uint public productCount;

    event ProductAdded(uint id, string name, string origin, uint price);
    event ProductTransferred(uint id, address newOwner, Status status);

    modifier onlyOwner(uint _id) {
        require(msg.sender == products[_id].owner, "Only the owner can perform this action");
        _;
    }

    function addProduct(string memory _name, string memory _origin, uint _price) public {
        productCount++;
        products[productCount] = Product(productCount, _name, _origin, Status.Produced, msg.sender, _price);
        productExists[productCount] = true;
        emit ProductAdded(productCount, _name, _origin, _price);
    }

    function buyProduct(uint _id) public payable {
        require(productExists[_id], "Product does not exist");
        require(products[_id].status == Status.Produced, "Product not available for sale");
        require(msg.value == products[_id].price, "Incorrect payment amount");

        address seller = products[_id].owner;
        products[_id].owner = msg.sender;
        products[_id].status = Status.Sold;
        
        payable(seller).transfer(msg.value);  // Transfer payment to the seller
        
        emit ProductTransferred(_id, msg.sender, Status.Sold);
    }

    function transferProduct(uint _id, address _newOwner) public onlyOwner(_id) {
        require(productExists[_id], "Product does not exist");
        products[_id].owner = _newOwner;
        products[_id].status = Status.InTransit;
        emit ProductTransferred(_id, _newOwner, Status.InTransit);
    }

    function confirmDelivery(uint _id) public onlyOwner(_id) {
        require(productExists[_id], "Product does not exist");
        products[_id].status = Status.Sold;
        emit ProductTransferred(_id, msg.sender, Status.Sold);
    }
}
