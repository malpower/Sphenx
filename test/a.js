const {Framework}=require("../");
const fs=require("fs");
(async ()=>
{
    let f=new Framework({entrance: "http://www.tpxl.com/",
        history: [],
        ready: [],
        hosts: ["www.tpxl.com"],
        retryCount: 4
    });
    setInterval(()=>
    {
        process.stdout.write("\b".repeat(50));
        process.stdout.write(`${f.scannedPageUrls.length}/${f.ready.length}`.padEnd(50, " "));
    }, 1000);
    await f.start(15);
    let list=f.scannedPageUrls;
    fs.writeFileSync("./result.json", JSON.stringify(list));
    console.log("FINISHED");
})();