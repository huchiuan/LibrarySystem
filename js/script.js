var bookDataFromLocalStorage = [];

$(function() {
    LoadBookData();
    var data = [
        { text: "資料庫", value: "" },
        { text: "網際網路", value: "" },
        { text: "應用系統整合", value: "" },
        { text: "家庭保健", value: "" },
        { text: "語言", value: "" }
    ]
    $(".fieldlist").kendoWindow({ //將HTML 中的fieldlist包起來成為 kendoWindow 並給予元素
        height: "50%",
        width: "30%",
        title: "新增書籍資料表",
        visible: false,
        position: {
            top: 100,
            left: "36.5%"
        }

    });

    $("#book_category").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: data,
        index: 0,
        change: ChangePicture
    });

    $("#bought_datepicker").kendoDatePicker({ //設定格式符合前面的邏輯
        format: "yyyy-MM-dd"
    });

    $("#book_grid").kendoGrid({
        dataSource: {
            data: bookDataFromLocalStorage,
            schema: {
                model: {
                    fields: {
                        BookId: { type: "int" },
                        BookName: { type: "string" },
                        BookCategory: { type: "string" },
                        BookAuthor: { type: "string" },
                        BookBoughtDate: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        toolbar: kendo.template("<div class='book-grid-toolbar'>查詢書籍:<input class='book-grid-search' placeholder='輸入書籍名稱或作者名稱......' type='text'></input></div>"),
        height: 550,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "BookId", title: "書籍編號", width: "10%" },
            { field: "BookName", title: "書籍名稱", width: "50%" },
            { field: "BookCategory", title: "書籍種類", width: "10%" },
            { field: "BookAuthor", title: "作者", width: "15%" },
            { field: "BookBoughtDate", title: "購買日期", width: "15%" },
            { command: { text: "刪除", click: DeleteBook }, title: " ", width: "120px" }
        ]

    });

    $(".book-grid-search").on('input', function() { //動態查詢的功能 使用filter 過濾  *放在此大包外面無法使用 因需要先被載入*
            var searchstring = $(".book-grid-search").val(); //抓搜尋欄位字元的關鍵字 
            var gridtotaldata = $("#book_grid").data("kendoGrid"); //將頁面下方欄位資料選出 //改名字 別叫DATA

            gridtotaldata.dataSource.filter({ //透過filter過濾出使用者的字串
                logic: "or", //可能有多種想查詢的資料
                filters: [
                    { field: "BookName", operator: "contains", value: searchstring },
                    { field: "BookAuthor", operator: "contains", value: searchstring }
                ]
            });
            $("#book_grid").data("kendoGrid").dataSource.read(); //刷新下面顯示列
        })
        // $("#msg").kendoValidator({

    //     rules: {
    //         dateValidation: function(input, params) {
    //             if (input.val() != "") {
    //                 var date = kendo.parseDate(input.val(), "yyyy-MM-dd"); //判斷是否能解析成功(代表格式正確)
    //                 if (date) {
    //                        //new Date("2019-05-01")
    //                     if ((new Date(date).getTime() < new Date(getTodayDate()).getTime())) { //判斷是否小於今日
    //                         return true;

    //                     } else {

    //                         return false;
    //                     }
    //                 }
    //                 return false;
    //             }
    //             return false;
    //         }
    //     },
    //     messages: { //螢幕上的警示
    //         dateValidation: "請輸入 yyyy-MM-dd 之格式或小於今日日期"
    //     }
    // });



})


$(".btn-add-book").on('click', function() { //當 click  btn-add-book class 時 觸發此fumcion(跳出的視窗新增書籍)

    if ($(".book_nameisnull").kendoValidator().data("kendoValidator").validate() &&
        $(".book_authorisnull").kendoValidator().data("kendoValidator").validate() ) {

        var category = $("#book_category").data("kendoDropDownList").text();
        //當去kendoDropDownList格式裡面拿他的資料
        var name = $("#book_name").val();
        //直接拿id 是 book_name 的資料
        var author = $("#book_author").val();
        //直接拿author是 book_author 的資料
        // var author = $("#book_author").data("kendoGrid").text(); 無法 因為#book_author 並無定義動態功能
        var date = $("#bought_datepicker").val();
        // 原本還有加.data("kendoDatePicker").val() 但這行是因為要針對此kendo 資料 拿出來會很醜 所以才不用 也不好整理

        var bookidindex = GetMaxIndex(bookDataFromLocalStorage); //找出最大值ID 用於插入的流水號

        //建立一個要插入bookDataFromLocalStorage陣列中的物件
        var insertitem = {
            "BookId": bookidindex + 1, //流水號為陣列最大的BOOKID +1 避免刪除跳號
            "BookCategory": category,
            "BookName": name,
            "BookAuthor": author,
            "BookBoughtDate": date,
            "BookPublisher": "" //原始網頁沒有 所以先放空
        }
        bookDataFromLocalStorage.push(insertitem); //將物件用js插入bookDataFromLocalStorage 陣列
        ReplaceStoreData(bookDataFromLocalStorage); //再把bookDataFromLocalStorage 陣列送回去localStorage
        $(".fieldlist").data("kendoWindow").close();
    }


})

$(".btn-new-book").on('click', function() { //點下頁面新增書籍 可以跳出kendoWindow
    $(".fieldlist").data("kendoWindow").open();
})



function getTodayDate() { //拿本日日期
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    return output;
}



function GetMaxIndex(bookDataFromLocalStorage) { //找陣列最大的INDEX值
    var max = 0;
    for (var index = 0; index <= bookDataFromLocalStorage.length - 1; index++) {
        if (bookDataFromLocalStorage[index].BookId >= max) {
            max = bookDataFromLocalStorage[index].BookId;
        }
    }
    return max;
}




function ReplaceStoreData(bookDataFromLocalStorage) { //再把結果送回去localStorage  ///叫做reload data or reset data
    localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
    $("#book_grid").data("kendoGrid").dataSource.read(); //刷新book_grid頁面
}


function LoadBookData() {
    bookDataFromLocalStorage = JSON.parse(localStorage.getItem("bookData"));
    if (bookDataFromLocalStorage == null) {
        bookDataFromLocalStorage = bookData;
        localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
    }
}

function ChangePicture() {

    debugger
    var ChangeString = "";

    if (this.text() == "資料庫") //加{}
        ChangeString = "image/database.jpg";
    else if (this.text() == "網際網路")
        ChangeString = "image/internet.jpg";
    else if (this.text() == "應用系統整合")
        ChangeString = "image/system.jpg";
    else if (this.text() == "家庭保健")
        ChangeString = "image/home.jpg";
    else
        ChangeString = "image/language.jpg";


    $("#testimg").attr("src", ChangeString); //替換連結 jquery寫法


}


function GetListIndex(id) { //將BOOKID 傳入 藉由此function 可以找到 在bookDataFromLocalStorage陣列的位置

    var datalength = 0;

    for (var index = 0; index <= bookDataFromLocalStorage.length - 1; index++) {
        if (bookDataFromLocalStorage[index].BookId == id) {
            return index;
        }
    }
    return null;
}


//功能註解
function DeleteBook(e) {

    //e代表event，是jQuery會傳進來的第一個参数
    //當監聽的事件發生時，瀏覽器會去執行我們透過 addEventListener() 
    //註冊的 Event Handler (EventListener) ，也就是我們所指定的 function。
    //這個時候，EventListener 會去建立一個「事件物件」 (Event Object)
    //，裡面包含了所有與這個事件有關的屬性，並且以「參數」的形式傳給我們的 Event Handler：

    e.preventDefault();

    //防止做其他事件 但還可以取得事件
    //<a role="button" class="k-button k-button-icontext k-grid-刪除" href="#">刪除</a>//
    var rowdata = this.dataItem($(e.target).closest("tr"));
    //通过e.target就可以獲取到 當前觸發對象資料 。 target : 表示觸發事件的元素 ，沒有加targer 找不到closest tr
    //.closest("tr") 拿到 點擊刪除的那行資料tr細節雜資料     closest(JQ)
    //dataItem 是 kendo的  可以取出混雜東西(grid之類的)的那筆datasource  
    //dataItem :
    // Returns the data item to which the specified table row is bound. The data item is a Kendo UI Model instance.
    $("#book_grid").data("kendoGrid").dataSource.remove(rowdata);
    //在前端立刻呈現刪除   (JQ)
    //console.log(data.BookId);
    var BookIdIndexNumber = GetListIndex(rowdata.BookId);
    //使用function 將 上面拿到tr資料的bookid資料
    //替換成在bookDataFromLocalStorage 陣列中的第幾筆
    //console.log(BookIdIndexNumber);
    bookDataFromLocalStorage.splice(BookIdIndexNumber, 1);
    //把陣列中的第BookIdIndexNumber筆的資料刪掉 (JS)
    ReplaceStoreData(bookDataFromLocalStorage);
    //將更改過的陣列寫回localStorage     (JS)
   localStorage.clear(); 

}