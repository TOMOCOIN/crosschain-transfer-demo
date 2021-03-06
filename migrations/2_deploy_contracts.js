var TomoCoinSidechain = artifacts.require('./TomoCoinSidechain');
var TomoCoinMainchain = artifacts.require('./TomoCoinMainchain');
var CashInSidechain = artifacts.require('./CashInSidechain');
var CashOutSidechain = artifacts.require('./CashOutSidechain');
var CashInMainchain = artifacts.require('./CashInMainchain');
var CashOutMainchain = artifacts.require('./CashOutMainchain');
var TokenAdmin = artifacts.require('./TokenAdmin');
var RewardEngine = artifacts.require('./RewardEngine');
var config = require('config');

module.exports = function(deployer) {
  if (deployer.network === 'sidechain') {
    const tomoCommunityDepositSidechain = config.get('rootAddressSidechain');
    return deployer.deploy(TomoCoinSidechain, tomoCommunityDepositSidechain).then(() => {
      return TomoCoinSidechain.deployed().then(function(tc) {
        return deployer.deploy(CashInSidechain, tc.address, tomoCommunityDepositSidechain).then(() => {
          return CashInSidechain.deployed().then(cis => {
            return tc.approve(cis.address, '40000000000000000000000000');
          });
        })
          .then(() => {
            return deployer.deploy(CashOutSidechain, tc.address);
          })
          .then(()  => {
            return CashOutSidechain.deployed().then(cos => {
              return tc.approve(cos.address, '40000000000000000000000000').then(() => {
                return tc.add(cos.address);
              });
            });
          })
          .then(()  => {
            return deployer.deploy(RewardEngine, tc.address, tomoCommunityDepositSidechain);
          })
          .then(()  => {
            return RewardEngine.deployed().then(re => {
              return tc.approve(re.address, '40000000000000000000000000');
            });
          });
      });
    });
  }
  if (deployer.network === 'mainchain' || deployer.network === 'ropsten' || deployer.network === 'rinkeby') {
    const tomoCommunityDepositMainchain = config.get('rootAddressMainchain');
    return deployer.deploy(TomoCoinMainchain, tomoCommunityDepositMainchain).then(() => {
      return TomoCoinMainchain.deployed().then(function(tc) {
        return deployer.deploy(CashInMainchain, tc.address).then(() => {
          return CashInMainchain.deployed().then(cim => {
            return tc.approve(cim.address, '40000000000000000000000000').then(() => {
              return tc.add(cim.address);
            });
          });
        })
          .then(() => {
            return deployer.deploy(CashOutMainchain, tc.address, tomoCommunityDepositMainchain);
          })
          .then(() => {
            return CashOutMainchain.deployed().then(com => {
              return tc.approve(com.address, '40000000000000000000000000');
            });
          });
      });
    });
  }
};
