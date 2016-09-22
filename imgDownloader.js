let wget=require("wget");
let conf=require("./conf");
let mongo=require("mongodb").MongoClient;
let urlParser=require("url");
function ImageDownloader()
{

    let db;

    function Utils()
    {
        let counter=0;
        this.getCounter=function()
        {
            return (counter++).toString();
        };
        this.isDownloaded=function(url,callback)
        {
            db.collection("Downloads").find({url: url}).toArray(function(err,list)
            {
                if (err || list.length===0)
                {
                    return callback(false);
                }
                callback(true);
            });
        };
        this.addDownload=function(url,local,success,callback)
        {
            db.collection("Downloads").insert({url: url,filename: local,success: success},function(res)
            {
                callback();
            });
        };
        this.checkDomain=function(url)
        {
            let o=urlParser.parse(url);
            for (let i=0;i<conf.domains.length;i++)
            {
                if (o.host===conf.domains[i])
                {
                    return true;
                }
            }
            return false;
        };
    }
    let utils=new Utils;



    function Downloader()
    {
        let downloadTaskList=new Array;
        function DownloadNext()
        {
            if (downloadTaskList.length===0)
            {
                return setTimeout(DownloadNext,500);
            }
            let url=downloadTaskList.shift();
            if (!utils.checkDomain(url) || url==="")
            {
                return process.nextTick(DownloadNext);
            }
            utils.isDownloaded(url,function(result)
            {
                if (result===true)
                {
                    return process.nextTick(DownloadNext);
                }
                let filename=conf.downloadPath+"/"+(new Date).getTime()+utils.getCounter();
                try
                {
                    filename+=url.match(/\.[a-zA-Z0-9]{0,}$/)[0];
                }
                catch (e)
                {
                    filename+=".png";
                }
                try
                {
                    let task=wget.download(url,filename,{});
                    task.on("error",function(e)
                    {
                        utils.addDownload(url,filename,false,function()
                        {
                            process.nextTick(DownloadNext);
                        });
                    });
                    task.on("end",function(output)
                    {
                        utils.addDownload(url,filename,true,function()
                        {
                            process.nextTick(DownloadNext);
                        });
                    });
                }
                catch (e)
                {
                    process.nextTick(DownloadNext);
                }
            });
        }
        DownloadNext();
        this.applyTask=function(url)
        {
            downloadTaskList.push(url);
        };
    }
    this.init=function(callback)
    {
        mongo.connect(conf.database,function(err,database)
        {
            if (err)
            {
                console.log(err);
                //process.exit(0);
            }
            db=database;
            process.nextTick(callback,new Downloader);
        });
    };
}

module.exports=ImageDownloader;
