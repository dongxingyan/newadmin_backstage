import {Page, IPageParams, page} from "../../../common/page";
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IDepartmentManagePageParams extends IPageParams {
    page: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    // params: ['page'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '机构管理系统',
    name: 'main.department-manage'
})
    /**
     * 页面类
     *
     * 1 会根据类名自动完成配置路由等功能。
     *      比如MainOrgPage就会生成一个状态名为“main.validate_sucessful”，url为“/main/page”的路由。(Page会被忽略)
     *      注意，如果输入的是MainOrg_ManPage的话，状态名会是"main.validate_sucessful-man"，url会是“/main/validate_sucessful-man”。
     *      也就是类名中的下划线“_”会被解析成连接符“-”。
     *      Page<IOrgPageParams>里面的IOrgPageParams用来指定这个页面所需要的路由参数，见上方的interface接口定义。
     *
     *  2 Page的对象会自带几个字段，分别是：
     *      1 scope $scope，作用域
     *      2 uiState $state，ui-router的路由服务
     *      3 params $stateParams，路由参数
     *      4 session SessionService，会话服务（项目位置common/session.ts），存储了这次会话的一些全局数据，比如token。
     *      5 remote RemoteService，远程接口服务（项目位置common/remote/*），存储了一些网络访问的函数，服务器数据在这里获取。
     *
     *   3 页面类的对象在模板上用vm表示。用   {{vm.**}}   这种方式做绑定就可以了。
     */
class MainDepartment_ManagePage extends Page<IDepartmentManagePageParams> {
    name = 'hello order manager';
    departments
    page: number;
    pageSize = 6;
    order: any[] = []
    pager: any[] = []
    total
    current
    next

    init(timeout: angular.ITimeoutService) {
        // timeout(() => {
        $.ajax({
            type:"get",
            url:global.API_PATH+'v1/orgs/'+sessionStorage.getItem("orgId")+'?token='+sessionStorage.getItem("token"),
            dataType:'json',
            success:function(data){
                var names=data.data.name

                var arr={
                    "id":0,
                    "parentId":-1,
                    "departName":names,
                    "org_id":sessionStorage.getItem("orgId"),
                    open:true,
                }
                $.ajax({
                    type:"get",
                    url:global.API_PATH+'v1/orgs/'+sessionStorage.getItem("orgId")+'/depts?token='+sessionStorage.getItem("token"),
                    dataType:'json',
                    success:function(data){
                        var zNodes=data.data.concat(arr);
                        var setting = {
                            view: {
                                addHoverDom: addHoverDom,
                                removeHoverDom: removeHoverDom,
                                selectedMulti: false,
                                showLine:false,
                            },
                            edit: {
                                enable: true,
                                editNameSelectAll: true,
                                showRemoveBtn: showRemoveBtn,
                                showRenameBtn: true,
                                removeTitle:'删除',
                                renameTitle:"重命名",
                                addmoreTitle:"添加子节点",

                            },
                            data: {
                                simpleData: {
                                    enable: true,
                                    idKey:'id',
                                    pIdKey:'parentId',
                                    rootPId:null,
                                },
                                key:{
                                    name:"departName"
                                }
                            },
                            callback: {
                                beforeDrag: beforeDrag,
                                beforeEditName: beforeEditName,
                                beforeRemove: beforeRemove,
                                beforeRename: beforeRename,
                                onRemove: onRemove,
                                onRename: onRename
                            },
                        };
                        var log, className = "dark";

                        function beforeDrag(treeId, treeNodes) {
                            return false;
                        }
                        function beforeEditName(treeId, treeNode) {
                            className = (className === "dark" ? "":"dark");
                            showLog("[ "+getTime()+" beforeEditName ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.departName);
                            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                            zTree.selectNode(treeNode);
                            // $(".alerts-delet").show()
                            // $(".bcgs").show()
                            // $(".alert-content").html("进入节点 -- " + treeNode.departName + " 的编辑状态吗？")
                            // return false
                            return confirm("进入节点 -- " + treeNode.departName + " 的编辑状态吗？");
                        }
                        function beforeRemove(treeId, treeNode) {
                            className = (className === "dark" ? "":"dark");
                            showLog("[ "+getTime()+" beforeRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.departName);
                            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                            zTree.selectNode(treeNode);
                            return confirm("确认删除 节点 -- " + treeNode.departName + " 吗？");
                        }
                        function onRemove(e, treeId, treeNode) {
                            $.ajax({
                                type:'delete',
                                url:global.API_PATH+'v1/orgs/{org_id}/depts/{dept_id}?token='+sessionStorage.getItem("token")+'&dept_id='+treeNode.id+'&org_id='+admin_id,
                                dataType:'json',
                                success:function(){
                                    showLog("[ "+getTime()+" onRemove ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.departName);
                                }
                            })


                            // 	}
                            // })

                        }
                        function beforeRename(treeId, treeNode, newName, isCancel) {
                            var flag
                            className = (className === "dark" ? "":"dark");
                            showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" beforeRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.name + (isCancel ? "</span>":""));
                            newName=$.trim(newName)
                            console.log(newName)
                            if (newName.length == 0) {
                                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                                setTimeout(function(){zTree.editName(treeNode)}, 10);
                                $(".bcgs").show();
                                $(".alerts").show()
                                $(".alert-content").html("部门名称不能为空")
                                flag=false;
                                $(".alert-sure").click(function(){
                                    location.reload()
                                })
                                $(".img-right").click(function(){
                                    location.reload()
                                })
                            }
                        }

                        function onRename(e, treeId, treeNode, isCancel) {

                            $.ajax({
                                type:"get",
                                dataType:"json",
                                url:global.API_PATH+'v1/orgs/'+sessionStorage.getItem("orgId")+'/depts/'+treeNode.id+'?token='+sessionStorage.getItem("token"),
                                success:function(data){
                                    var parentidss=data.data.parentId;
                                    var c=treeNode.id;
                                    var d=treeNode.departName
                                    var data={
                                        deptId:c,
                                        parentId:parentidss,
                                        departName:d
                                    }
                                    console.log(data)
                                    var url1 = global.API_PATH+'v1/orgs/'+sessionStorage.getItem('orgId')+'/depts/'+c+'?token='+sessionStorage.getItem("token");
                                    var xmlhttp = new XMLHttpRequest();
                                    xmlhttp.open("put", url1, false);
                                    // xmlhttp.setRequestHeader("token", this.token);
                                    xmlhttp.setRequestHeader("Content-Type", "application/json");
                                    xmlhttp.send(JSON.stringify(data));

                                    if(xmlhttp.status==200){
                                        console.log(JSON.parse(xmlhttp.responseText))
                                        var codes=JSON.parse(xmlhttp.responseText)
                                        if(codes.code==19){
                                            $(".bcgs").show();
                                            $(".alerts").show()
                                            $(".alert-content").html("创建失败，部门名称不能重复")
                                            $(".alert-sure").click(function(){
                                                location.reload()
                                            })
                                            $(".img-right").click(function(){
                                                location.reload()
                                            })




                                        }
                                        else{
                                            showLog((isCancel ? "<span style='color:red'>":"") + "[ "+getTime()+" onRename ]&nbsp;&nbsp;&nbsp;&nbsp; " + treeNode.departName + (isCancel ? "</span>":""));
                                        }
                                    }else{
                                        console.log("faile");
                                        console.log(JSON.parse(xmlhttp.responseText));
                                    }

                                }
                            })
                        }
                        function showRemoveBtn(treeId, treeNode) {
                            return !treeNode.isParent;
                        }
                        function showRenameBtn(treeId, treeNode) {
                            return !treeNode.isLastNode;
                        }
                        function showLog(str) {
                            if (!log) log = $("#log");
                            log.append("<li class='"+className+"'>"+str+"</li>");
                            if(log.children("li").length > 8) {
                                log.get(0).removeChild(log.children("li")[0]);
                            }
                        }
                        function getTime() {
                            var now= new Date(),
                                h=now.getHours(),
                                m=now.getMinutes(),
                                s=now.getSeconds(),
                                ms=now.getMilliseconds();
                            return (h+":"+m+":"+s+ " " +ms);
                        }

                        var newCount = 1;
                        function addHoverDom(treeId, treeNode) {
                            var sObj = $("#" + treeNode.tId + "_span");
                            if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
                            var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                                + "' title='add node' onfocus='this.blur();'></span>";
                            sObj.after(addStr);
                            var btn = $("#addBtn_"+treeNode.tId);
                            if (btn) btn.bind("click", function(){
                                var prompts=$.trim(prompt("请输入部门名称"))
                                // alert(prompts)
                                $.ajax({
                                    type:"get",
                                    dataType:"json",
                                    url:global.API_PATH+'cloudpServer/v1/orgs/'+sessionStorage.getItem("orgId")+'/depts?token='+sessionStorage.getItem("token"),
                                    success:function(data){
                                        var content=data.data;
                                        var lengths=data.data.length;
                                        var array=new Array();
                                        for (var i =0; i <lengths; i++) {
                                            array.push(content[i].departName)
                                        }
                                        var d=array.indexOf(prompts)
                                        if((d==-1)&&(prompts!=='')){
                                            var data={
                                                parentId:treeNode.id,
                                                departName:prompts
                                            }
                                            var url1 = global.API_PATH+'cloudpServer/v1/orgs/'+sessionStorage.getItem("orgId")+'/depts?token='+sessionStorage.getItem("token");
                                            var xmlhttp = new XMLHttpRequest();
                                            xmlhttp.open("post", url1, false);
                                            // xmlhttp.setRequestHeader("token", this.token);
                                            xmlhttp.setRequestHeader("Content-Type", "application/json");
                                            xmlhttp.send(JSON.stringify(data));

                                            if(xmlhttp.status==200){
                                                console.log(JSON.parse(xmlhttp.responseText))
                                                var codes=JSON.parse(xmlhttp.responseText)
                                                if(codes.code==0){
                                                    var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                                                    zTree.addNodes(treeNode, {id:(100 + newCount),parentId:treeNode.id, departName:encodeURI(prompts)});
                                                    location.reload()
                                                    return false;
                                                }
                                            }else{
                                                console.log("faile");
                                                console.log(JSON.parse(xmlhttp.responseText));
                                            }
                                        }
                                        else if(prompts==''){
                                            $(".bcgs").show();
                                            $(".alerts").show()
                                            $(".alert-content").html("部门名称不能为空")
                                        }
                                        else{
                                            $(".bcgs").show();
                                            $(".alerts").show()
                                            $(".alert-content").html("部门名称不能重复")
                                        }
                                    }

                                })


                            })

                        };
                        function removeHoverDom(treeId, treeNode) {
                            $("#addBtn_"+treeNode.tId).unbind().remove();
                        };
                        function selectAll() {
                            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                            zTree.setting.edit.editNameSelectAll =  $("#selectAll").attr("checked");
                        }

                        $(document).ready(function(){
                            $.fn.zTree.init($("#treeDemo"), setting, zNodes);
                            $("#selectAll").bind("click", selectAll);
                        });
                    }
                })
            }
        })
        // })
    }
    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

}