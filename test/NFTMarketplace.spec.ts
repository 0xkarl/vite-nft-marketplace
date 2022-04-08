// import { describe } from "mocha";
import { expect } from 'chai';
const vuilder = require('@vite/vuilder');
import config from './vite.config.json';

let provider: any;
let deployer: any;

describe('Marketplace', () => {
  before(async function () {
    provider = vuilder.newProvider(config.networks.local.http);
    console.log(await provider.request('ledger_getSnapshotChainHeight'));
    deployer = vuilder.newAccount(config.networks.local.mnemonic, 0, provider);
    console.log('deployer', deployer.address);
  });

  it('works', async () => {
    // compile
    const { NFTMarketplace } = await vuilder.compile('NFTMarketplace.solpp');
    const { BAYC } = await vuilder.compile('BAYC.solpp');

    // deploy
    BAYC.setDeployer(deployer).setProvider(provider);
    await BAYC.deploy({ params: ['BoredApeYachtClub', 'BAYC'] });
    expect(BAYC.address).to.be.a('string');
    console.log('BAYC', BAYC.address);

    NFTMarketplace.setDeployer(deployer).setProvider(provider);
    await NFTMarketplace.deploy({ params: ['1000', BAYC.address] });
    expect(NFTMarketplace.address).to.be.a('string');
    console.log('NFTMarketplace', NFTMarketplace.address);

    // // check default balance
    // expect(await cafe.balance()).to.be.equal('0');
    // // check default value of data
    // let result = await cafe.query('price', []);
    // console.log('return', result);
    // expect(result).to.be.an('array').with.lengthOf(1);
    // expect(result![0]).to.be.equal('1000000000000000000');

    // // call Cafe.buyCoffee(to, numOfCups);
    // const block = await cafe.call(
    //   'buyCoffee',
    //   ['vite_3345524abf6bbe1809449224b5972c41790b6cf2e22fcb5caf', 2],
    //   { amount: '2000000000000000000' }
    // );

    // // console.log(block);
    // const events = await cafe.getPastEvents('Buy', {
    //   fromHeight: block.height,
    //   toHeight: block.height,
    // });
    // expect(events).to.be.an('array').with.lengthOf(1);
    // expect(events[0]?.returnValues?.from).to.be.equal(deployer.address);
    // expect(events[0]?.returnValues?.to).to.be.equal(
    //   'vite_3345524abf6bbe1809449224b5972c41790b6cf2e22fcb5caf'
    // );
    // expect(events[0]?.returnValues?.num).to.be.equal('2');

    // expect(await cafe.balance()).to.be.equal('0');
  });
});
