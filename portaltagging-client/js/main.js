/**
 * Created by xinli on 2016/12/16.
 */

//tag结构
var tagTree = {data:null,treeProps: {
                children: 'children',
                label: 'name'}
            };
var checkedTag = null;

//Portal
var myPortal;
var portalContent ={items:[]};

var Main = new Vue({
    el:"#header",
    data:tagTree,
    created: function () {
    this.getAllTagInfos();
   },
    methods: {
        handleSelect:function(key, keyPath) {
            var index = 0;
            var contents = document.getElementsByClassName("content");
            for(index;index<contents.length;index++){
                contents[index].style.display = "none";
            }
            contents[parseInt(key)-1].style.display = "";
        },
        //从服务器读取所有的tag view tree信息
       getAllTagInfos:function(){
           this.$http.get("//localhost:3000/portaltags/")
           .then(function(response){tagTree.data=response.body});
        }

    }
});

require(["portal-js/portal"], function (portal) {

        myPortal = new portal.Portal({
        url: "https://www.seanpc.com/arcgis/"
      });
      
      
}); 



//递归循环读取tagID所在tree的索引号层级,返回string=0,1,12,3  表示tagTree[0].children[1].children[12].children[3]
function searchTreeIndex(tagTree,tagId){
    var i=0;
    for(i;i<tagTree.length;i++){
        if(tagTree[i].id == tagId){
            return i;
        }

        if(tagTree[i].children.length>0){
            var temp = null;
            temp = searchTreeIndex(tagTree[i].children,tagId);
            if(temp!=null){
                return  i + "," + temp;
            }
        }
    }
};

//递归循环读取tagID所在tree的label信息,返回string=L1:L2:L3
function searchTreeTagLabels(tagTree,tagId){
    var i=0;
    for(i;i<tagTree.length;i++){
        if(tagTree[i]._id == tagId){
            return tagTree[i].label;
        }

        if(tagTree[i].children.length>0){
            var temp = null;
            temp = searchTreeTagLabels(tagTree[i].children,tagId);
            if(temp!=null){
                return  tagTree[i].label + ":" + temp;
            }
        }
    }
};

//标签管理
var tagmanageBtns = new Vue({
    el:'#tagmanagebtngroup',
    data:function(){
        return{
            newTagViewVisible:false,
            newTagVisible:false,
            newSubTagVisible:false,
            deleteTagVisible:false,
            deleteTagName:"",
            updateTagNameVisible:false,
            form:{
                name:''
            },
            formLabelWidth:'120px'
        };
    },
    methods:{
        addNewTagView:function(){
            this.newTagViewVisible=false;
            
            var newTag = {
                _id:null,
                name:this.form.name,
                type:'tagView',
                children:[]
            };
            this.$http.post("//localhost:3000/portaltags",newTag)
           .then(function(response){
               nt = response.body;
               nt.children=[];
               Main.getAllTagInfos();
            });

            this.form.name = "";
        },
        addNewTag:function(){
            this.newTagVisible = false;

            var newTag = {
                _id:null,
                name:this.form.name,
                type:'tag',
                children:[]
            };
            this.$http.post('//localhost:3000/portaltags/'+ checkedTag._id +'/addChild',newTag)
           .then(function(response){
               nt = response.body;
               nt.children=[];
               //checkedTag.children.push(nt);
               Main.getAllTagInfos();
            });

            this.form.name = "";
        },
        addNewSubTag:function(){
            this.newSubTagVisible = false;

             var newTag = {
                _id:null,
                name:this.form.name,
                type:'tagGroup',
                children:[]
            };

            this.$http.post('//localhost:3000/portaltags/'+ checkedTag._id +'/addChild',newTag)
           .then(function(response){
               nt = response.body;
               nt.children=[];
               //checkedTag.children.push(nt);
               Main.getAllTagInfos();
            });

            this.form.name = "";
        },
        deleteTagBtnHandler:function(){
            this.deleteTagName = checkedTag.label;
            this.deleteTagVisible = true;
        },
        deleteTag:function(){
            this.$http.delete('//localhost:3000/portaltags/'+ checkedTag._id)
           .then(function(response){
               Main.getAllTagInfos();
           });

            this.deleteTagVisible = false;
        },
        updateTagNameBtnHandler:function(){
            this.updateTagNameVisible = true;
            this.form.name = checkedTag.label;
        },
        updateTagName:function(){
            checkedTag.name = this.form.name;
            this.$http.put('//localhost:3000/portaltags/'+ checkedTag._id,checkedTag)
           .then(function(response){

           });

            this.updateTagNameVisible = false;
        }
    }
});

//标签树状结构
var tagmanageTree = new Vue({
    el:'#tagtree',
    data:tagTree,
    methods:{
        handleNodeClick:function(data) {
            console.log("当前点击的节点名称："+data.name+",ID："+data._id);
            checkedTag = data;
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//读取Portal中的Items信息
var getPortalItems = function(pageIndex,pageSize){
   
   return myPortal.userContent(myPortal.username,'').then(function(data){
                     
                        while(portalContent.items.length>0){
                            portalContent.items.pop();
                        }
                        var end = pageIndex*pageSize-1;
                        if(end>data.items.length)
                        {
                            end = data.items.length;
                        }
                        var part = data.items.slice((pageIndex-1)*pageSize,end);
                        for(i=0;i<part.length;i++) 
                        {
                            portalContent.items.push(part[i]);
                        }
                        tagrelationTable.$data.total = data.total;
                     
                 }
    );
};

//根据taglabels查询关联的items
var searchItemsByTags=function(tags,pageIndex,pageSize){
    var q='tags:( ';
                 for(i=0;i<tags.length;i++) 
                        {
                            if(i>0)
                            {
                                q=q + " "+'+\"'+tags[i]+'\"';
                            }
                            else
                            {
                                q=q+'+\"'+tags[0]+'\"';
                            }
                            
                        }
                        q=q+" )";
 return myPortal.search(q,0,100,'','').then(function(data){
                     
                        while(portalContent.items.length>0){
                            portalContent.items.pop();
                        }
                        var end = pageIndex*pageSize-1;
                        if(end>data.results.length)
                        {
                            end = data.results.length;
                        }
                        var part = data.results.slice((pageIndex-1)*pageSize,end);
                        for(i=0;i<part.length;i++) 
                        {
                            portalContent.items.push(part[i]);
                        }
                        tagrelationTable.$data.total = data.total;
                     
                 }
    );
}

//写tag到Portal items的标签中
var writeTagsToPortalItem=function(portalItems,tags){
    for(i=0;i<portalItems.length;i++)
    {
        myPortal.itemDescription(portalItems[i].id).then(function(itemDesrp){
            var folder ='';
            if(itemDesrp.ownerFolder!=null)
            {
                folder=itemDesrp.ownerFolder;
            }
            while(itemDesrp.tags.length>0)
            {
                itemDesrp.tags.pop();
            }
            for(var i=0;i<tags.length;i++)
            {
                //var s = tags[i].toString().replace(/::/g,'_');
                itemDesrp.tags.push(tags[i]);
            }
            myPortal.updateDescription(myPortal.username,itemDesrp.id,folder,itemDesrp).then(function(data){
                getPortalItems(tagrelationTable.$data.pageIndex,tagrelationTable.$data.pageSize);
            });
        });
    }
}


//////########################
//标签关联
var tagrelationBtns = new Vue({
    el:'#tagrelationbtngroup',
    data:function(){
        return{
            loginDlgVisible:false,
            form:{
                name:'',
                password:""
            },
            formLabelWidth:'120px'
        };
    },
    methods:{
        loginPortalDlg:function(){ //登陆portal
            this.loginDlgVisible = false;
            //登陆
            myPortal.username=this.form.name;
            myPortal.password = this.form.password;
             myPortal.generateToken(this.form.name,this.form.password).then(function(data){
                 myPortal.token=data.token;
                 getPortalItems(tagrelationTable.$data.pageIndex,tagrelationTable.$data.pageSize);
             });
        },
        reloadItemsBtnHandler:function(){ //重新读取所有的items
            getPortalItems(tagrelationTable.$data.pageIndex,tagrelationTable.$data.pageSize);
        },
        setRelationBtnHandler:function(){  //设置关联关系
            if(tagrelationTree.$children[0].getCheckedNodes(false).length==0){
                this.$message({
                    showClose: true,
                    message: '请选择关联的标签项',
                    type: 'warning'
                });
            }else if(tagrelationTable.$data.multipleSelection.length==0){
                this.$message({
                    showClose: true,
                    message: '请选择关联的items项',
                    type: 'warning'
                });
            }else {
                var tags = tagrelationTree.getTags();
                writeTagsToPortalItem(tagrelationTable.$data.multipleSelection,tags);
            }
        },
        removeRelationBtnHandler:function(){  //删除选中的items
        },
        searchRelationBtnHandler:function(){ //查找关联的items
            var tags = tagrelationTree.getTags();
            searchItemsByTags(tags,tagrelationTable.$data.pageIndex,tagrelationTable.$data.pageSize);
        }
    }
});

//标签树状结构
var tagrelationTree = new Vue({
    el:'#tagrelationtree',
    data:tagTree,
    methods:{
        handleNodeClick:function(data) {
            console.log("当前点击的节点名称："+data.name+",ID："+data._id);
            checkedTag = data;

            //清空选择项
            tagrelationTable.clearAllSelection();
        },
        getTags:function(){
            var tags=[];
            var nodes = this.$children[0].getCheckedNodes(false);
            for(var i=0;i<nodes.length;i++){
                var n = nodes[i];
                if(n.type=='tag'){
                    tags.push(n.fullname);
                }
            }
            return tags;
        }
    }
});

//portal items表格
var tagrelationTable = new Vue({
    el:'#tagrelationtable',
    data:{
        tableData:portalContent.items,
        multipleSelection:[],
        pageIndex:1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 50, 100]
    },
    methods:{
        handleSelectionChange:function(val) {
            this.multipleSelection = val;
        },
        clearAllSelection:function(){
            this.$refs.table.clearSelection();
        },
        sizeChange:function(pageSize){
            this.pageSize = pageSize;
            getPortalItems(this.pageIndex,this.pageSize);
        },
        pageIndexChange:function(pageIndex){
            this.pageIndex = pageIndex;
            getPortalItems(this.pageIndex,this.pageSize);
        }
    }
});






