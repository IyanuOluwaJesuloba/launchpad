#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String};

/// SEP-41 Token Contract
/// Full implementation tracked in issues #1–#6
#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(
        _env: Env,
        _admin: Address,
        _decimal: u32,
        _name: String,
        _symbol: String,
        _initial_supply: i128,
        _max_supply: Option<i128>,
    ) {
        todo!("implement initialize — see PRD section 6.2")
    }

    pub fn mint(_env: Env, _to: Address, _amount: i128) {
        todo!("implement mint — see issue #4 for max_supply enforcement")
    }

    pub fn burn(_env: Env, _from: Address, _amount: i128) {
        todo!()
    }

    pub fn transfer(_env: Env, _from: Address, _to: Address, _amount: i128) {
        todo!("see issue #1 for freeze check")
    }

    pub fn balance(_env: Env, _id: Address) -> i128 {
        todo!()
    }

    pub fn admin(_env: Env) -> Address {
        todo!()
    }

    pub fn decimals(_env: Env) -> u32 {
        todo!()
    }

    pub fn name(_env: Env) -> String {
        todo!()
    }

    pub fn symbol(_env: Env) -> String {
        todo!()
    }

    pub fn total_supply(_env: Env) -> i128 {
        todo!()
    }
}
