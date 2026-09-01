// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandLedger {
    struct Property {
        string ulpin;
        string unitId;
        string recordHash;
        string geometryHash;
        uint256 timestamp;
        address registeredBy;
        bool exists;
    }

    mapping(string => Property) private properties;

    event PropertyRegistered(
        string indexed ulpin,
        string unitId,
        string recordHash,
        string geometryHash,
        uint256 timestamp,
        address indexed registeredBy
    );

    function _getKey(string memory ulpin, string memory unitId) internal pure returns (string memory) {
        return string(abi.encodePacked(ulpin, "#", unitId));
    }

    function registerProperty(
        string calldata ulpin,
        string calldata unitId,
        string calldata recordHash,
        string calldata geometryHash
    ) external {
        string memory key = _getKey(ulpin, unitId);
        require(!properties[key].exists, "Property already registered");

        properties[key] = Property({
            ulpin: ulpin,
            unitId: unitId,
            recordHash: recordHash,
            geometryHash: geometryHash,
            timestamp: block.timestamp,
            registeredBy: msg.sender,
            exists: true
        });

        emit PropertyRegistered(
            ulpin,
            unitId,
            recordHash,
            geometryHash,
            block.timestamp,
            msg.sender
        );
    }

    function getProperty(
        string calldata ulpin,
        string calldata unitId
    )
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            address
        )
    {
        string memory key = _getKey(ulpin, unitId);
        Property memory prop = properties[key];
        require(prop.exists, "Property not found");

        return (
            prop.ulpin,
            prop.unitId,
            prop.recordHash,
            prop.geometryHash,
            prop.timestamp,
            prop.registeredBy
        );
    }

    event SubdivisionRecorded(
        bytes32 indexed parentParcelHash,
        bytes32[] childParcelHashes,
        uint256 timestamp,
        string metadataURI
    );

    function recordSubdivision(
        string calldata parentUlpin,
        string[] calldata childUlpins,
        string calldata metadataURI
    ) external {
        string memory parentKey = _getKey(parentUlpin, "BASE");
        require(properties[parentKey].exists, "Parent property not registered");

        bytes32 parentHash = keccak256(abi.encodePacked(parentUlpin, "#BASE"));
        bytes32[] memory childHashes = new bytes32[](childUlpins.length);
        
        for (uint256 i = 0; i < childUlpins.length; i++) {
            childHashes[i] = keccak256(abi.encodePacked(childUlpins[i], "#BASE"));
        }

        emit SubdivisionRecorded(
            parentHash,
            childHashes,
            block.timestamp,
            metadataURI
        );
    }
}
