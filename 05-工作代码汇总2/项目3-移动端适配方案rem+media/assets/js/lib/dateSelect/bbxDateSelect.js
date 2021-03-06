/**
 * Created by hqh on 2017/2/14.
 */
function bbxDatePicker(callback){
    //初始化页面当前时间
    var curTime = new Date();
    $('li.time input').val('现在出发 ' + doubleNumber(curTime.getHours()) + ':' + doubleNumber(curTime.getMinutes())).attr('data-value', formatDate(curTime, 'yyyy-MM-dd HH:mm:ss'));
    //选择出发日期
    $('li.time input').off('click').on('click', function(){
        _bbxDatePicker(curTime);
    });

    function _bbxDatePicker(curTime){
        var datesData = generateDateList(curTime);
        showTimePicker(datesData);
        showSlotsBySelectedValue(curTime);
        $('#sw-wrapper').on('touchend', function(event){
            setTimeout(function(){
                showSlotsBySelectedValue(curTime);
                event.preventDefault();
            }, 100);
        });
    }

    //根据当前时间 生成日期列表数据
    function generateDateList(curTime){
        var datesData = {};
        datesData.minutes = {
            0: {value: 0, text: '00'},
            10: {value: 10, text: '10'},
            20: {value: 20, text: '20'},
            30: {value: 30, text: '30'},
            40: {value: 40, text: '40'},
            50: {value: 50, text: '50'}
        };
        datesData.hours = {};
        datesData.dates = {};
        for(var i=0; i<24; i++){
            datesData.hours[i] = {value: i, text: doubleNumber(i)};
        }

        var datesArr = [];
        datesArr[0] = {
            value: formatDate(curTime, 'yyyy/MM/dd HH:mm'),
            text: '现在出发'
        };

        var totalDays = 15; //预约15天之内的时间
        if(!(curTime.getHours() == 23 && curTime.getMinutes() >= 50)){    //当前日期在23:50之前时, 日期列表显示今天的数据
            var item = {
                value: formatDate(curTime, 'yyyy/MM/dd'),
                text: formatDate(curTime, 'MM月dd日') + ' 今天'
            }
            datesArr.push(item);
        }
        for(var i=1; i<totalDays; i++){
            var timeStamp = curTime.getTime();
            var _curTime = new Date(timeStamp);
            var date = new Date(_curTime.setDate(_curTime.getDate() + i));
            var weekText = '';
            switch(i){
                case 1:
                    weekText = '明天';
                    break;
                case 2:
                    weekText = '后天';
                    break;
                default:
                    weekText = toWeekString(date.getDay());
                    break;
            }
            var item = {
                value: formatDate(date, 'yyyy/MM/dd'),
                text: formatDate(date, 'MM月dd日') + ' ' + weekText
            };
            datesArr.push(item);
        }
        for(var i=0; i<datesArr.length; i++){
            datesData.dates[i] = datesArr[i];
        }
        console.log('生成日期列表数据：' + JSON.stringify(datesData));
        return datesData;
    }

    //打开日期选择控件
    function showTimePicker(datesData){
        SpinningWheel.addSlot(datesData.dates, 'date');
        SpinningWheel.addSlot(datesData.hours, 'hour');
        SpinningWheel.addSlot(datesData.minutes, 'minute');
        SpinningWheel.open();
        SpinningWheel.setCancelAction(cancel);
        SpinningWheel.setDoneAction(done);
    }

    //根据选中的日期判断日期显示与隐藏(比如:当选择'现在出发'时只显示日期,小时和分钟隐藏)
    function showSlotsBySelectedValue(curTime){
        var selectedDate = SpinningWheel.getSelectedValues();
        console.log('当前选中的日期是：' + JSON.stringify(selectedDate));
        if(selectedDate.keys[0] == 0){  //日期选择第1列('现在出发')时, 隐藏小时和分钟数(第2、3列)
            $('.sw-hour, .sw-minute').hide();
        } else{
            $('.sw-hour, .sw-minute').css({'display': 'table-cell'});
            if(selectedDate.keys[0] == 1 && selectedDate.values[0].text.indexOf('今天') != -1){   //日期选择第2列时,若第2列的日期是今天, 选择的小时和分钟数(第2、3列)在30分钟之后
                var curHour = curTime.getHours(),
                    curMinute = curTime.getMinutes();
                if(parseInt(selectedDate.values[1].value) <= curHour){
                    SpinningWheel.scrollToValue(1, curHour);
                    if(curMinute + 30 > 50){
                        SpinningWheel.scrollToValue(1, curHour+1);
                        var bMinute = Math.ceil((curMinute-30)/10) * 10;
                        if(selectedDate.values[2].value < bMinute){
                            SpinningWheel.scrollToValue(2, bMinute);
                        }
                    } else{
                        var bMinute = Math.ceil(curMinute/10) * 10 + 30;
                        if(selectedDate.values[2].value < bMinute){
                            SpinningWheel.scrollToValue(2, bMinute);
                        }
                    }
                } else if(parseInt(selectedDate.values[1].value) == curHour+1){
                    var bMinute = Math.ceil((curMinute-30)/10) * 10;
                    if(selectedDate.values[2].value < bMinute){
                        SpinningWheel.scrollToValue(2, bMinute);
                    }
                }
            }
        }
    }

    //确定
    function done(){
        var result = SpinningWheel.getSelectedValues();
        var date = result.values[0],
            hour = result.values[1],
            minute = result.values[2];
        var key = date.text;
        var time = '', timeText = '';
        if(key.indexOf('现在出发') != -1){
            time = date.value;
            timeText = '现在出发 ' + time.split(' ')[1];
        } else if(key.indexOf('今天') != -1){
            time = date.value + ' ' + hour.text + ':' + minute.text;
            timeText = '今天 ' + hour.text + ':' + minute.text;
        } else if(key.indexOf('明天') != -1){
            time = date.value + ' ' + hour.text + ':' + minute.text;
            timeText = '明天 ' + hour.text + ':' + minute.text;
        } else if(key.indexOf('后天') != -1){
            time = date.value + ' ' + hour.text + ':' + minute.text;
            timeText = '后天 ' + hour.text + ':' + minute.text;
        } else{
            time = date.value + ' ' + hour.text + ':' + minute.text;
            timeText = date.text.split(' ')[0] + hour.text + ':' + minute.text;
        }
        setTimeout(function(){
            // 备注: 此处使用setTimeout执行函数解决在某些手机上点击'确认'时日期弹窗无法关闭问题
            $('li.time input').val(timeText).attr('data-value', time);
            if(callback){
                callback();
            };
        },500);
    }

    //取消
    function cancel(){
        //console.log('点击了取消！');
    }

    //将个位数字转化为双位数
    function doubleNumber(number){
        if(parseInt(number) < 10){
            number = '0' + number;
        }
        return number;
    }

    //将一周中的某一天转化为星期几
    function toWeekString(i){
        var str = '';
        switch(parseInt(i)){
            case 0:
                str = '周日';
                break;
            case 1:
                str = '周一';
                break;
            case 2:
                str = '周二';
                break;
            case 3:
                str = '周三';
                break;
            case 4:
                str = '周四';
                break;
            case 5:
                str = '周五';
                break;
            case 6:
                str = '周六';
                break;
        }
        return str;
    }

    //格式化日期 @param date 日期 @param format 格式化样式,例如yyyy-MM-dd HH:mm:ss  @return 格式化后的结果
    function formatDate(date, format){
        var v = "";
        if (typeof date == "string" || typeof date != "object") {
            return;
        }
        var year  = date.getFullYear();
        var month  = date.getMonth()+1;
        var day   = date.getDate();
        var hour  = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var weekDay = date.getDay();
        var ms   = date.getMilliseconds();

        var weekDayString = "";
        if (weekDay == 1) {
            weekDayString = "星期一";
        } else if (weekDay == 2) {
            weekDayString = "星期二";
        } else if (weekDay == 3) {
            weekDayString = "星期三";
        } else if (weekDay == 4) {
            weekDayString = "星期四";
        } else if (weekDay == 5) {
            weekDayString = "星期五";
        } else if (weekDay == 6) {
            weekDayString = "星期六";
        } else if (weekDay == 7) {
            weekDayString = "星期日";
        }

        v = format;
        //Year
        v = v.replace(/yyyy/g, year);
        v = v.replace(/YYYY/g, year);
        v = v.replace(/yy/g, (year+"").substring(2,4));
        v = v.replace(/YY/g, (year+"").substring(2,4));

        //Month
        var monthStr = ("0"+month);
        v = v.replace(/MM/g, monthStr.substring(monthStr.length-2));

        //Day
        var dayStr = ("0"+day);
        v = v.replace(/dd/g, dayStr.substring(dayStr.length-2));

        //hour
        var hourStr = ("0"+hour);
        v = v.replace(/HH/g, hourStr.substring(hourStr.length-2));
        v = v.replace(/hh/g, hourStr.substring(hourStr.length-2));

        //minute
        var minuteStr = ("0"+minute);
        v = v.replace(/mm/g, minuteStr.substring(minuteStr.length-2));

        //Millisecond
        v = v.replace(/sss/g, ms);
        v = v.replace(/SSS/g, ms);

        //second
        var secondStr = ("0"+second);
        v = v.replace(/ss/g, secondStr.substring(secondStr.length-2));
        v = v.replace(/SS/g, secondStr.substring(secondStr.length-2));

        //weekDay
        v = v.replace(/E/g, weekDayString);
        return v;
    }
}