#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env};

/// Vesting Contract
/// Full implementation tracked in issues #3, #5, #6
#[contract]
pub struct VestingContract;

#[contractimpl]
impl VestingContract {
    pub fn initialize(_env: Env, _admin: Address, _token_contract: Address) {
        todo!()
    }

    /// Create a cliff + linear vesting schedule for a recipient.
    /// Ledger numbers used instead of timestamps.
    pub fn create_schedule(
        _env: Env,
        _recipient: Address,
        _total_amount: i128,
        _cliff_ledger: u32,
        _end_ledger: u32,
    ) {
        todo!()
    }

    /// Release all currently vested tokens to recipient.
    /// Can be called by anyone.
    pub fn release(_env: Env, _recipient: Address) {
        todo!()
    }

    /// Admin-only: revoke a schedule, send vested portion to recipient,
    /// return remainder to admin. See issue #3.
    pub fn revoke(_env: Env, _recipient: Address) {
        todo!("implement revoke — see issue #3")
    }

    pub fn vested_amount(_env: Env, _recipient: Address) -> i128 {
        todo!()
    }

    pub fn released_amount(_env: Env, _recipient: Address) -> i128 {
        todo!()
    }
}
