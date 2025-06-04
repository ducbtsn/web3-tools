import { Transaction } from "sui-v30/transactions";
import { DeepBookMarketMaker } from "../deepbook/market-maker";
import * as dotenv from "dotenv";
dotenv.config();
// Return 1 DEEP to DEEP_SUI pool
const flashLoanExample = async () => {
  const tx = new Transaction();
  const deepbook = new DeepBookMarketMaker(
    process.env.SUI_PRIVATE_KEY || "",
    "mainnet"
  );

  console.log("Active address:", deepbook.getActiveAddress());

  // 1. Borrow 1 DEEP from DEEP_SUI pool
  const borrowAmount = 1;
  const [deepCoin, flashLoan] = tx.add(
    deepbook.dbClient.flashLoans.borrowBaseAsset("DEEP_SUI", borrowAmount)
  );

  // 2. Swap 1 SUI for USDC using borrowed DEEP
  const [baseOut, quoteOut, deepOut] = tx.add(
    deepbook.dbClient.deepBook.swapExactBaseForQuote({
      poolKey: "SUI_USDC",
      amount: 1,
      deepAmount: 1,
      minOut: 0,
      deepCoin: deepCoin,
    })
  );

  tx.transferObjects([baseOut, quoteOut, deepOut], deepbook.getActiveAddress());

  // 3. Execute second trade to get back DEEP for repayment
  const [baseOut2, quoteOut2, deepOut2] = tx.add(
    deepbook.dbClient.deepBook.swapExactQuoteForBase({
      poolKey: "DEEP_SUI",
      amount: 5,
      deepAmount: 0,
      minOut: 0,
    })
  );

  tx.transferObjects([quoteOut2, deepOut2], deepbook.getActiveAddress());

  // 4. Return borrowed DEEP
  const loanRemain = tx.add(
    deepbook.dbClient.flashLoans.returnBaseAsset(
      "DEEP_SUI",
      borrowAmount,
      baseOut2,
      flashLoan
    )
  );

  // Send the remaining coin to user's address
  tx.transferObjects([loanRemain], deepbook.getActiveAddress());

  const res = await deepbook.simulateTransaction(tx);
  console.log("Simulation result:", res);
  if (res.effects.status.status == "success") {
    const res = await deepbook.signAndExecuteTransaction(tx);
    console.log("Transaction executed with digest:", res.digest);
    console.log("Transaction effects:", res.effects);
  } else {
    console.error("Simulation failed:", res.effects.status.error);
  }
};

flashLoanExample();
