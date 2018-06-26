const table=document.querySelector('.table');
const tHead=table.querySelector('thead');
const tBody=table.querySelector('tbody');
const btns=document.querySelector('.btn');
const addtr=btns.querySelector('.addtrbtn');
const addth=btns.querySelector('.addthbtn');
const tHeadTr=tHead.querySelector('tr');

function app(parentNode,eventType,node,fn){
    parentNode.addEventListener(eventType,(event)=>{
        // 这个事件代理函数有点小bug, 可能当目标元素(.cell)有子节点时，就不灵了。
        // 想办法还原这个bug，并尝试解决。
        // 你可以先实现下面要求的closest函数后再来思考这个问题。
        if(event.target.matches(node)){
            fn.apply(event.target,arguments);
        }
        else{
            let targetParent=event.target.parentNode;
            while(!targetParent.matches(node)){
                targetParent=targetParent.parentNode;
            }
            fn.apply(targetParent,arguments);
        }
    });
}

function closest(elm,selector){
    if(elm.matches(selector)){
        return elm;
    }
    else{
        let selectorElm=elm;
        // 1. 这里的判断可能有点小问题，parentNode会不会一直找不到，直到null?
        // 2. 能否把if上半部分的判断，和这个while给结合起来，让代码更加精简？
        // 关于格式化：
        // 1. if 的格式一般会写成
        /*
        if (...) {
          ...
        } else {
          
        }
        */
       // 2. 养成在=号等操作符左右加空格的习惯， 那样代码可读性会增加。
       // 注意我代码中空格，空行的使用，可以google简单找找代码风格，然后遵循以养成习惯
        while(!selectorElm.matches(selector)){
            selectorElm=selectorElm.parentNode;
        }
        return selectorElm;
        
    }
}

app(tBody,'click','.cell',function(){
    this.classList.add('focus');
    this.innerHTML='<div class="ui fluid icon input"><input type="text" class="input-cell"></div>';
    const inputCell=table.querySelector('.input-cell');
    inputCell.focus();
});

app(tBody,'focusout','.input-cell',function(){
    // this.parentNode.parentNode.classList.remove('focus');
    closest(this,'.cell').classList.remove('focus');
    // 使用在jquery中，一般不会使用parentNode.parentNode这种和节点层次相关的方法，因为容易出bug
    // 而是会使用 $(this).closest('.cell') 来直接找到指定选择器的父节点
    // 尝试实现closest函数，函数签名为: closest(elm, selector) -> {Element}
    const ancestor=closest(this,'.cell');
    // 这里的空判断的正则有误，要加上^和$，而且还要考虑多个字符的情况
    // 字符串为空，也可以直接 trim() 掉，在if中判断
    if(!(/\s/.test(this.value))){
        //判断是否是数字
        // 这个正则式好像能匹配  12. 这样的形式哦， 需要优化下。
        if((/^\d+\.?\d*$/).test(this.value)){
            ancestor.classList.add('num');
        }
        ancestor.innerHTML=this.value;
    }
    else{
        ancestor.innerHTML='';
    }

    //求和
    //求和是从哪一行到哪一列（以列为主导）
    //获取tHead所有的th;
    let tHeadTh=tHeadTr.querySelectorAll('th');
    let trLists=tBody.querySelectorAll('tr');
    const regSum=/^=sum\(([A-z]\d):([A-z]\d)\)$/;
    const regMean=/^=mean\(([A-z]\d):([A-z]\d)\)$/;

    if(regSum.test(this.value)){
        const numData=getSum(trLists);
        ancestor.innerHTML=numData.sum;
        ancestor.classList.add('num');

    }
    //求平均值
    if(regMean.test(this.value)){
        const numData=getSum(trLists);
        ancestor.innerHTML=numData.sum/numData.divisor;
        ancestor.classList.add('num');
    }
});

function getSum(trArr){
    // 尽量不要使用RegExp.$1等静态变量，比较容易出bug，不好排查
    // 咱们可以在上面匹配后，将match传进来。
    const list1=RegExp.$1.split('');
    const list2=RegExp.$2.split('');
    const firstcol=(list1[0].charCodeAt(0))%65+1;
    const lastcol=(list2[0].charCodeAt(0))%65+2;
    const firstrow=parseInt(list1[1])-1;
    const lastrow=parseInt(list2[1]);
    const divisor=(lastcol-firstcol)*(lastrow-firstrow);
    let sum=0;

    //2层循环表格
    for(var i=firstrow;i<lastrow;i++){
        for(var j=firstcol;j<lastcol;j++){
            let tdLists=trArr[i].querySelectorAll('td'); 
            if(parseFloat(tdLists[j].innerHTML)){
                sum+=parseFloat(tdLists[j].innerHTML);
            }
        }
    }
    return {
        'sum':sum,
        'divisor':divisor
    };
}

//增加行
//tbody包括几个tr
//tr包括几个td,包括几个class=cell的td
addtr.addEventListener('click',function(){
    const trNode=document.createElement('tr');
    const trLists=tBody.querySelectorAll('tr');
    const tdLists=trLists[0].querySelectorAll('td');//6
    const len=trLists.length;

    // 这里可以用let，保持一致性，用es6时就只用const或let，而不用var
    for(var i=0;i<tdLists.length;i++){
        const tdNode=document.createElement('td');
        if(i===0){
            tdNode.innerHTML=len+1;
        }
        else{
            tdNode.innerHTML='';
            tdNode.classList.add('cell');
        }
        trNode.appendChild(tdNode);
    }
    tBody.appendChild(trNode);
});

//增加列
//tbody一共包括多少个tr
//在每个tr的结尾处加上个td
//怎样使英文字母往后递增（利用ASCII）fromCharCode
addth.addEventListener('click',function(){
    const trLists=tBody.querySelectorAll('tr');
    const thNode=document.createElement('th');
    const tHeadTh=tHeadTr.querySelectorAll('th');
    const len=tHeadTh.length;

    thNode.innerHTML=String.fromCharCode(65+len-1);
    tHeadTr.appendChild(thNode);

    for(var i=0;i<trLists.length;i++){
        const tdNode=document.createElement('td');
        tdNode.classList.add('cell');
        trLists[i].appendChild(tdNode);
    }
});


// 尝试实现以下几个函数

(function() {

    // 使用上Array#reduce
    function sum(list) {
      // TODO
    }

    sum([1, 2, 3, 4]);

    
    // 求一个对象列表中, age的和。 注：只对 >0 的age项求和
    // 要求用上 Array#filter, Array.map
    // 用上上面写的sum函数
    function sumAge(list) {
      
    }

    sumAge([
        { name: 'a', age: 10 },
        { name: 'b', age: -1 },
        { name: 'c' },
        { name: 'd', e: 19 },
        { name: 'e', age: 2 },
        { name: 'f', age: 7 }
    ]);
})();