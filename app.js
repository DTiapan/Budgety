/*
Author : Ajas Bakran
Description : Budget Application
For this project we will use module pattern to implement the application
*/

//BUDGET CONTROLLER, to caluclate and store values in Data staructure

var budgetController = (function() {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; 

    var calculateTotal = function(type) {
     var sum = 0;
     data.allItems[type].forEach(function(cur) {
         sum += cur.value;
     }); 

     data.totals[type] = sum;

    };
   
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return {
        addItem : function (type, des, val) {
            var newItem, ID;
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);    
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Add data to data object in respective arrays
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem : function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
                
            index = ids.indexOf(id);

            if (index >= 0) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget : function() {
            // calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc'); 
            // calculate the budget : income - expense
                data.budget = data.totals.inc - data.totals.exp;
                if (data.totals.inc > 0) {
                    // calculate the percenetage of income we spent
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
                } else {
                    data.percentage = -1;
                }
            

        },

        calculatePercentages : function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function() {
            var allPerc = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage    
            }
        },

        testing : function () {
            console.log(data);
        }
    };

})();


//UI controller, to update the values to UI
var UIController = (function() {
    //UI code
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'

    }; 
    var fromatNumber = function(num, typeOfExp) {
        var numSplit, int, dec, typeOfExp;
        // 1. + or - before the number 
        num = Math.abs(num);
         // 2. Exactly the decimal points
        num = num.toFixed(2);
        
        numSplit = num.split('.');

        int = numSplit[0];
        // 3. Seperate number after thousand by comma, expample -> 1,000
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }
        dec = numSplit[1];
        
        return (typeOfExp === 'exp' ? '-' : '+') + ' ' + int +'.'+ dec;
       
        
    };

    var nodeListForEach = function(list, callback) {
        for (var i=0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput : function() {

            return {
                 // type would be either inc or exp
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml
            //Create HTML string with placeholder tag            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>'
            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace the placehoder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',fromatNumber(obj.value, type));
            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },
        
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var typeofExp;
            obj.budget > 0 ? typeofExp = 'inc' : typeofExp = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = fromatNumber(obj.budget, typeofExp);
            document.querySelector(DOMstrings.incomeLabel).textContent = fromatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = fromatNumber(obj.totalExp, 'exp');
            

            if (obj.percentage > 0) {
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
            } else {
               document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            //console.log('percentages are ' + percentages);
            var fields  = document.querySelectorAll(DOMstrings.expensesPercLabel);
            var fieldsLen  = document.querySelectorAll('.item__percentage').length;
            //console.log('Fields are ' + fields);
            //console.log('Fields len is ' + fieldsLen);
            

            nodeListForEach(fields, function(current, index) {
                console.log('function called');
                if (percentages[index] > 0) {
                    current.textContent = percentages[index]+'%';
                }   else {
                    current.textContent = '---';
                }
                
            });
        },
        displayMonth : function() {
            var now, month, year, locale;
            now = new Date();
            year = now.getFullYear();
           // month = now.getMonth();

            locale = "en-us";
            month = now.toLocaleString(locale, {month: "long"});

            document.querySelector(DOMstrings.dateLabel).textContent = month +' '+year;
        },

        changedType : function() {
            var selector 

           /* inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
*/
            selector  = DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue;
            //selector  = '.add__type,.add__description,.add__value';
            //console.log('selector is '+selector);
            var fields = document.querySelectorAll(selector);
 
            nodeListForEach (fields, function(curr) {
                curr.classList.toggle('red-focus');
            });
        },

        getDOMstrings : function() {
            return DOMstrings;
        }
    }
})();


// APP Controller, which will combine both controller 
// i.e. budgetController and UIController
//its more like MVC pattern, Model, View and Controller

var controller = (function(budgetCtrl, UICtrl) {
    var setUpEventListners = function() {
        var DOM  = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                //console.log('Enter pressed')
                ctrlAddItem();
            }
        }); 
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
   
    var updateBudget = function () {
        //  1. Calculate the budget
            budgetCtrl.calculateBudget();
        //  2. Return the budget
            var budget = budgetCtrl.getBudget();
       //   3. Display the budget on the UI
           // console.log(budget);
            UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {
        // 1. Calculate percetages
            budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
           // console.log(percentages);
            UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem = function() {
       // console.log('function called...')
        var input, newItem;
       //   1.Get the input data from the field
       var input = UICtrl.getinput();
       //   console.log(input);
       if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
       //   2.Add the item to the budget controller
       var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
       //   3. Add the item to UI
       UICtrl.addListItem(newItem, input.type);
       //   4. Clear the fields
       UICtrl.clearFields();
       // 5. calculate and Update Budget
       updateBudget();
       // 6. Calculate and update the percentages.
       updatePercentages();
       }
    };
    
    var ctrlDeleteItem = function(event) {
       //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
       var itemID, splitID,type, ID;
       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

       if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure.
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI.
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget.
            updateBudget();
            // 4. Calculate and update the percentages.
            updatePercentages();
       }
    };
    return {
        init : function () {
            console.log('Application started...');
            UICtrl.displayMonth();
            var obj = {   
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1 
            }

            UICtrl.displayBudget(obj);
            setUpEventListners();
        }
    };

})(budgetController, UIController);

controller.init();