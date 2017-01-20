/**
 * Created by xinli on 2016/12/17.
 */

var TreeController = {
    addNewTag:function(tagTreeData,newTagName){
        var tag = {
            label:newTagName
        };

        tagTreeData.push(tag);
    },
    addNewSubTag:function(parentTag,newSubTagName){
        var subTag = {
            label:newSubTagName
        };

        if(parentTag.children){
            parentTag.children.push(subTag);
            //return subTag;
        }else{
            var tmpParentTag = {
                id:parentTag.id,
                label:parentTag.label,
                children:[subTag]
            };
            //parentTag = tmpParentTag;

            return tmpParentTag;
        }
    }

};