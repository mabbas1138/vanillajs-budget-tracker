
// BUDGET CONTROLLER //
// IIFE 
const budgetController = (function() {

  const Expense = function (id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };


  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id,
    this.description = description,
    this.value = value
  }

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }


  return {
    addItem: function(type, des, val) {
      let newItem, ID; 

      // Create new ID
      if (data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
          ID = 0;
      }

      if (type === 'exp') {
          newItem = new Expense(ID, des, val);

      } else if (type === 'inc') {
          newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids, index;

      // id = 3
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id)

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }

    },

    calculateBudget: function() {

      // Calculate total income and expenses

      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses

      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percetange = Math.round((data.totals.exp / data.totals.inc) * 100)
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {

      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };

})(); // it is immediately invoked using that callback immediately following the function.


///////////


// UI CONTROLLER //
const UIController = (function() {

  const DOMstrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

    const formatNumber = function (num, type) {
        let numSplit, int, dec;

        // this is now a string
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //if input is 2310, output is 2,310...we don't want that because this could lead to something like 2,3510 for 23510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

      };

  const nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // read value of type -- either 'inc' or 'exp'
        description: document.querySelector(DOMstrings.inputDesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    }, 

    addListItem: function(obj, type) {
      let html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === 'inc') {
         element = DOMstrings.incomeContainer;

         html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete">
        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;

      } else if (type === 'exp') {
         element = DOMstrings.expensesContainer;

          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data 
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


      // Insert the HTML into the DOM

        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

      deleteListItem: function(selectorID) {
        let elem = document.getElementById(selectorID)

        elem.parentNode.removeChild(elem);

      },

      clearFields: function() {
        let fields, fieldsArray;

        fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);

        fieldsArray = Array.prototype.slice.call(fields);

        // forEach params can be whatever you want
        fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArray[0].focus();

    },

    displayBudget: function(obj) {
      let type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

            displayPercentages: function (percentages) {

              const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

              nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                  current.textContent = percentages[index] + '%';
                } else {
                  current.textContent = '---';
                }
              });

            },

    displayMonth: function() {
      const now = new Date();
      const month = now.getMonth();
      const months = ['January', 'February', 'March', 'April', 'May',
        'June', 'July', 'August', 'September', 'October', 'November', 'December']
      
      const year = now.getFullYear(); 

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {

      const fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDesc + ',' + 
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

     document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();


///////////


// GLOBAL APP CONTROLLER //

// we name it budgtCtrl UICtrl allows us to keep the originally named controllers independent. Less rewriting if we wanted to rename them.
const appController = (function(budgetCtrl, UICtrl) {

  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', appAddItem);

    // Allow users to press 'return' instead of just 'click' -- we want to extend this to ALL the controllers, so we declare it here.

    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || event.which === 13) {
        appAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', appDeleteItem);

    // Change event toggles whenever there's a change to the dropdown menu
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  }

  const updateBudget = function() {
    // 1. Calculate the budget

    budgetCtrl.calculateBudget();

    // 2. Return the budget 

    const budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI

    UICtrl.displayBudget(budget);
  }

  const appAddItem = function() {
    let newItem, input;

    // 1. Get the input field data 
    
   input = UICtrl.getInput();

    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to the budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the new item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields

      UICtrl.clearFields();

      // 5. Calculate and update the budget

      updateBudget();
    }
  };

  const appDeleteItem = function(event) {
    let itemID, splitID, type, ID;
   
    // DOM Traversing -- the click event will move up four parent nodes
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);

    if(itemID) {
   
      // inc-1
      splitID = itemID.split('-'); // split method is for strings
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the user interface
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log('App has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);

// Initialize app //

appController.init();