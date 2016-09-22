let ImageDownloader=require("./imgDownloader");
let pageCA=require("./pageContentAsker");
let conf=require("./conf");


let dlers=new Array;
for (let i=0;i<10;i++)
{
    let x=new ImageDownloader;
    x.init(function(dler)
    {
        dlers.push(dler);
        if (dlers.length===10)
        {
            process.nextTick(StartCrawl);
        }
    });
}
function StartCrawl()
{
    let pointer=0;
    pageCA.init(conf.entry,function(images)
    {
        for (let i=0;i<images.length;i++)
        {
            pointer%=10;
            dlers[pointer].applyTask(images[i]);
            console.log(images[i]);
            pointer++;
        }
    });
}
