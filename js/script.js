'use strict';

// сделал IIFE, чтобы переменные не были доступны из консоли
(() => {
   /**
    * @see
    * используется два класса 'visually-hidden' и 'hidden'
    * 'visually-hidden' - делает блок невидимым с сохранением места для элемента,
    * это необходимо для скрытия кнопок пагинации
    * 'hidden' - скрывает блок полностью, необходим для скрытия всплывающего окна
    */

   const
      url = 'https://infernotw.github.io/table.json',
      header = document.querySelector('.table-header'),
      body = document.querySelector('.table-body'),
      pagination = document.querySelector('.pagination'),
      pageNumbers = pagination.querySelector('.buttons-wrapper'),
      tableStrTemplate = document.querySelector('.table-string'),
      pagBtnFirst = pageNumbers.querySelector('.first'),
      pagBtnSecond = pageNumbers.querySelector('.second'),
      pagBtnThird = pageNumbers.querySelector('.third'),
      btnPrev = pageNumbers.querySelector('.scroll--prev'),
      btnPrevAll = pageNumbers.querySelector('.scroll--prev-all'),
      btnNext = pageNumbers.querySelector('.scroll--next'),
      btnNextAll = pageNumbers.querySelector('.scroll--next-all'),
      searchBlock = document.querySelector('.product-search'),
      searchInput = searchBlock.querySelector('.input-search'),
      headerCells = header.querySelector('.table-string'),
      popupBlock = document.querySelector('.popup-block'),
      errorBlock = document.querySelector('.error-block'),
      // изначальное состояние сортировки
      defState = 'defState',
      rubles = ' ₽',
      // длина массива на одну страницу
      arrLength = 10,
      // если в поиске больше символов, то поиск заработает
      searchLetters = 2,
      enterKeyCode = 13;

   const table = {
      /**
       * объект с массивами данных на все страницы
       * @type {Object}
       */
      pageDataObj: {},
      /**
       * номер страницы
       * @type {number}
       */
      page: 0,
      /**
       * исходный массив данных
       * @type {Array}
       */
      sourceData: null,
      /**
       * полученный массив данных
       * @type {Array}
       */
      currentArr: null,
      /**
       * последня страница
       * @type {number}
       */
      lastPage: null,
      /**
       * сортировка выставлена в состояние "без сортировки"
       * @type {boolean|string}
       */
      sortUp: defState,
      /**
       * сортируемый столбик
       * @type {HTMLElement}
       */
      sortedColumn: null,

      /**
       * получаю объект, в котором каждой странице будет соответствовать определенный массив
       * по 10 элементов в каждом
       * @param {Array} jsonData полученный массив данных
       * @returns {boolean|void}
       */
      getTablePages(jsonData) {
         let
            pageArr = [],
            pageNumber,
            index,
            isLastPage;

         // если длина пришедшего массива данных равно нулю, то возвращаю false
         if (!jsonData.length) {
            this.pageDataObj = {};
            return false;
         }

         // заполняю массив, исходя из условий
         jsonData.forEach((element, i) => {
            pageArr.push(element);
            // определяю последняя ли это страница массива
            isLastPage = (i + 1 === jsonData.length);

            // если длина полученного массива равна условию отображения данных на одной странице
            // или индекс равен длине пришедшего массива, то записываю массив в объект и обнуляю этот массив
            if (pageArr.length === arrLength || isLastPage) {
               index = i.toString();

               // если длина индекса больше 1, то режу массив для получения номера массива объекта
               // номер массива объекта равен: (длина строки индекса - 1)
               // если меньше, то это нулевой массив объекта
               pageNumber = index.length > 1 ? index.slice(0, index.length - 1) : '0';

               // если страница последняя, то записываю номер страницы в переменную
               if (isLastPage) {
                  this.lastPage = parseInt(pageNumber);
               }

               // записываю массив в объект под номером страницы
               this.pageDataObj[pageNumber] = pageArr;
               // обнуляю полученный массив
               pageArr = [];
            }
         });
      },

      /**
       * заполняю тело таблицы и отрисовываю полученные данные
       */
      fillTableBody() {
         let
            tableElement,
            market;

         // очищаю тело таблицы
         body.innerHTML = '';

         // проверяю наличие поля в объекте, если он есть, то прохожусь по его элементам, заполняю данными
         // и отрисовываю на странице
         this.pageDataObj[this.page] && this.pageDataObj[this.page].forEach(element => {
            tableElement = tableStrTemplate.cloneNode(true);
            market = tableElement.querySelector('.table-cell__market');

            // задаю data-атрибуты для клетки market
            market.dataset.popupId = element.id;
            market.dataset.popupName = element.productName;
            market.dataset.popupPrice = element.price;
            market.dataset.popupLife = element.shelfLife;
            market.dataset.popupMarket = element.market;

            tableElement.querySelector('.table-cell__id').textContent = element.id;
            tableElement.querySelector('.table-cell__name').textContent = element.productName;
            tableElement.querySelector('.table-cell__price').textContent = element.price + rubles;
            tableElement.querySelector('.table-cell__shelf-life').textContent = element.shelfLife;
            tableElement.querySelector('.table-cell__market').textContent = element.market;

            body.appendChild(tableElement);
         });
      },

      /**
       * пагинация
       * @param {number} pageNumber переданный номер страницы
       */
      changePage(pageNumber) {
         const
            // если в поиске что-то написано, то подставляю полученные данные, исходя из поиска,
            // если пусто, то подставляю изначальный массив данных
            data = searchInput.value ? this.currentArr : this.sourceData,
            pgNumber = parseInt(pageNumber),
            newPage = pgNumber - 1,
            isPgLast = this.lastPage === newPage;

         // состояние отображения кнопок быстрого перемещения пагинации
         // левые кнопки
         this.toggleBtns(!newPage, true);
         // правые кнопки
         this.toggleBtns(isPgLast, false);

         // задаю значения и отображаемый текст кнопкам с номерами страниц
         // первая кнопка
         pagBtnFirst.value = pgNumber - 1;
         pagBtnFirst.innerText = pgNumber - 1;

         // вторая кнопка
         pagBtnSecond.value = pgNumber;
         pagBtnSecond.innerText = pgNumber;

         // третья кнопка
         pagBtnThird.value = pgNumber + 1;
         pagBtnThird.innerText = pgNumber + 1;

         // задаю значения кнопкам перемещения
         // к следующей странице
         btnNext.value = pgNumber + 1;
         // к предыдущей странице
         btnPrev.value = pgNumber - 1;

         // задаю номер текущей страницы
         this.page = pgNumber - 1;

         this.fillTableBody(data);
      },

      /**
       * поиск
       * @param {Object} evt 
       * @returns {Function}
       */
      searchFunction(evt) {
         const value = evt.target.value.toLowerCase();
         let
            productName,
            hasMore;

         // если длина искомого слова больше 2 символов или строка поиска пуста,
         // то выполняю поиск и заполняю тело таблицы полученным массивом
         // или выполняю поиск по нажатию на enter
         if (value.length > searchLetters || !value.length || evt.keyCode === enterKeyCode) {
            this.currentArr = [];
            // обнуляю объект массивов страниц
            this.pageDataObj = {};

            // если строка поиска пуста, то заполняю таблицу исходным массивом
            if (!value.length) {
               this.sortArray(this.sourceData, true);
               this.getTablePages(this.sourceData);
               // устанавливаю первую страницу и обнуляю пагинацию
               this.changePage(1);
               hasMore = this.lastPage > 1;

               // если страниц больше одной, то отрисовываю кнопки пагинации
               this.toggleBtns(!hasMore, false);

               // при исходном массиве, если пагинация скрыта, то отрисовываю ее
               pagination.classList.remove('visually-hidden');

               // задаю значения кнопке быстрого перемещения к последней странице
               btnNextAll.value = this.lastPage + 1;
               return this.fillTableBody(this.sourceData);
            }

            // происходит поиск по исходному массиву
            this.sourceData.forEach(el => {
               productName = el.productName.toLowerCase();

               // если введенные данные существуют в массиве,
               // то записываю найденный элемент в текущий массив
               if (productName.indexOf(value) + 1) {
                  this.currentArr.push(el);
               }
            });

            this.getTablePages(this.currentArr);
            this.changePage(1);

            hasMore = this.lastPage < 1 || !this.currentArr.length;

            // если страница одна или данных нет, то скрываю пагинацию
            pagination.classList.toggle('visually-hidden', hasMore);

            btnNextAll.value = this.lastPage + 1;
            return this.fillTableBody(this.currentArr);
         }
      },

      /**
       * сортировка массива данных
       * @param {Array} data 
       * @param {boolean} toggleClasses условие выполнения сброса отображения сортировки
       * @param {string} value передаваемое значение нажатой ячейки
       */
      sortArray(data, toggleClasses, value) {
         // a - первое сравниваемое число
         // b - второе сравниваемое число
         data.sort((a, b) => {
            let
               aValue = a[value],
               bValue = b[value];
            const isFiniteNumber = Number.isFinite(aValue);

            // если сортировка по дате
            if (value === 'shelfLife') {
               aValue = this.getFormattedDate(aValue);
               bValue = this.getFormattedDate(bValue);
            }

            switch (this.sortUp) {
               case true:
                  // возвращение к исходному состоянию сортировки при удалении данных 
                  // из строки поиска
                  this.resetSort(toggleClasses);

                  // сортировка от большего к меньшему
                  // проверка сортировки по числам
                  if (isFiniteNumber) {
                     return bValue - aValue;
                  }

                  // сортировка по алфавиту 
                  return aValue > bValue ? -1 : 1;
               case false:
                  this.resetSort(toggleClasses);

                  // сортировка от меньшего к большему
                  if (isFiniteNumber) {
                     return aValue - bValue;
                  }

                  return aValue < bValue ? -1 : 1;
               case defState:
                  // сортировка по id от меньшего к большему
                  return a.id - b.id;
            }
         });
      },

      /**
       * выставляю правильную дату в нужном формате: ДД.ММ.ГГ
       * @param {string} dateString дата
       * @returns {Date}
       */
      getFormattedDate(dateString) {
         let date = dateString.split('.');
         date = `${date[1]}.${date[0]}.${date[2]}`;
         return new Date(date);
      },

      /**
       * сортировка
       * @param {Object} evt 
       * @returns {Function | boolean}
       */
      tableSortBy(evt) {
         const
            // если в строке поиска есть данные, то сортируемые данные - полученный массив при поиске
            // если пусто, то сортируется исходный массив
            data = searchInput.value ? this.currentArr : this.sourceData,
            target = evt.target,
            value = target.getAttribute('value');

         // если клик по первой ячейке или по бордеру шапки, то сортировка не происходит
         if (target.classList.contains('table-cell__id') || target.classList.contains('table-string')) {
            return false;
         }

         // удаление признаков сортировки у активной ячейки, 
         // если клик произошел по неактивной ячейке
         this.resetSort(this.sortedColumn && target !== this.sortedColumn);

         // записываем в this нажатую ячейку
         this.sortedColumn = target;

         // добавление класса с картинкой направления сортировки при нажатии
         switch (this.sortUp) {
            case true:
               // при нажатии устанавливается состояние "от меньшего к большему"
               this.sortUp = false;
               target.classList.remove('up');
               target.classList.add('down');
               break;
            case false:
               // при нажатии устанавливается состояние "без сортировки"
               this.sortUp = defState;
               target.classList.remove('down');
               target.classList.add('def');
               // сбрасываем показания нажатой ячейки, потому что сортировки нет
               this.sortedColumn = null;
               break;
            case defState:
               // при нажатии устанавливается состояние "от большего к меньшему"
               this.sortUp = true;
               target.classList.remove('def');
               target.classList.add('up');
               break;
         }

         this.sortArray(data, false, value);
         this.getTablePages(data);
         this.changePage(1);
         return this.fillTableBody(data);
      },

      /**
       * сброс сортировки
       * @param {boolean} toggleClasses условие, при котором сортировка сбрасывается
       */
      resetSort(toggleClasses) {
         if (toggleClasses) {
            this.sortUp = defState;
            this.sortedColumn.classList.remove('up');
            this.sortedColumn.classList.remove('down');
            this.sortedColumn.classList.add('def');
         }
      },

      /**
       * всплываемое окно при клике
       * @param {Object} evt 
       */
      showPopup(evt) {
         const
            target = evt.target,
            id = target.dataset.popupId,
            name = target.dataset.popupName,
            price = target.dataset.popupPrice,
            life = target.dataset.popupLife,
            market = target.dataset.popupMarket;

         popupBlock.querySelector('.table-cell__id').textContent = id;
         popupBlock.querySelector('.table-cell__name').textContent = name;
         popupBlock.querySelector('.table-cell__price').textContent = price;
         popupBlock.querySelector('.table-cell__shelf-life').textContent = life;
         popupBlock.querySelector('.table-cell__market').textContent = market;

         // если клик происходит по клетке, у которой есть data-атрибут id, то удаляю 
         // класс у всплывающего окна, если нет - добавляю
         popupBlock.classList.toggle('hidden', !id);
      },

      /**
       * переключение видимости кнопок быстрого перемещения пагинации
       * @param {boolean} isToggle выбираем состояние кнопок - отображение/скрытие
       * @param {boolean} isPrev выбираем, какие кнопки будут скрыты - назад или вперед
       */
      toggleBtns(isToggle, isPrev) {
         (isPrev ? pagBtnFirst : pagBtnThird).classList.toggle('visually-hidden', isToggle);
         (isPrev ? btnPrev : btnNext).classList.toggle('visually-hidden', isToggle);
         (isPrev ? btnPrevAll : btnNextAll).classList.toggle('visually-hidden', isToggle);
      },

      /**
       * инициализация событий
       */
      initEvents() {
         searchInput.addEventListener('input', this.searchFunction.bind(this));
         // для совершению поиска по enter
         searchInput.addEventListener('keydown', this.searchFunction.bind(this));
         pageNumbers.addEventListener('click', (evt) => {
            const
               target = evt.target,
               // получаю значение нажатой кнопки
               page = parseInt(target.value);

            // если клик не по кнопкам пагинации или по текущей странице, то ничего не происходит
            if ((target.tagName.toLowerCase() !== 'button') || page === this.page + 1) {
               return;
            }

            this.changePage(page);
         });
         headerCells.addEventListener('mousedown', this.tableSortBy.bind(this));
         document.addEventListener('click', this.showPopup);
      },
      init() {
         fetch(url).then(ans => {
            const data = ans.json();

            data.then(dataArr => {
               // если данные получены - отрисовываю таблицу
               searchBlock.classList.remove('hidden');
               pagination.classList.remove('hidden');

               // изначально скрываю левые кнопки быстрого перемещения пагинации
               this.toggleBtns(true, true);

               this.initEvents();
               this.sourceData = dataArr;
               this.getTablePages(dataArr);
               this.fillTableBody(dataArr);

               // задаю значения быстрого перемещения 
               // к первой странице
               btnPrevAll.value = 1;
               // к последней странице
               btnNextAll.value = this.lastPage + 1;
            }).catch(() => {
               errorBlock.classList.remove('hidden');
            });
         }).catch(() => {
            errorBlock.classList.remove('hidden');
         });
      }
   };

   table.init();
})();