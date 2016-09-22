let downloader=require("./imgDownloader");
let pageCA=require("./pageContentAsker");


downloader.init(function(dler)
{
    pageCA.init("https://sg.yahoo.com/?p=us",function(images)
    {
        for (let i=0;i<images.length;i++)
        {
            dler.applyTask(images[i]);
        }
    });
});
