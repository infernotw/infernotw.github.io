(function () {
    var CONSTANTS = {
        url: 'https://infernotw.github.io/table.json',
        defState: 'defState',
        rubles: ' ₽',
        arrLength: 10,
        searchLetter: 2,
        enterKeycode: 13
    };
    var Table = /** @class */ (function () {
        function Table() {
            /**
             * шапка таблицы
             * @type {HTMLElement} _header
             * @private
             */
            this._header = document.querySelector('.table-header');
            /**
             * тело табилцы
             * @type {HTMLElement} _body
             * @private
             */
            this._body = document.querySelector('.table-body');
            /**
             * пагинация
             * @type {HTMLElement} _pagination
             * @private
             */
            this._pagination = document.querySelector('.pagination');
            /**
             * врапер кнопок пагинации
             * @type {HTMLElement} _pageNumbers
             * @private
             */
            this._pageNumbers = this._pagination.querySelector('.buttons-wrapper');
            /**
             * темплейт строки таблицы
             * @type {HTMLElement} _tableStrTemplate
             * @private
             */
            this._tableStrTemplate = document.querySelector('.table-string');
            /**
             * первая кнопка пагинации
             * @type {HTMLButtonElement} _pagBtnFirst
             * @private
             */
            this._pagBtnFirst = this._pageNumbers.querySelector('.first');
            /**
             * вторая кнопка пагинации
             * @type {HTMLButtonElement} _pagBtnSecond
             * @private
             */
            this._pagBtnSecond = this._pageNumbers.querySelector('.second');
            /**
             * третья кнопка пагинации
             * @type {HTMLButtonElement} _pagBtnThird
             * @private
             */
            this._pagBtnThird = this._pageNumbers.querySelector('.third');
            /**
             * кнопка перехода к предыдущей странице
             * @type {HTMLButtonElement} _btnPrev
             * @private
             */
            this._btnPrev = this._pageNumbers.querySelector('.scroll--prev');
            /**
             * кнопка перехода к первой странице
             * @type {HTMLButtonElement} _btnPrevAll
             * @private
             */
            this._btnPrevAll = this._pageNumbers.querySelector('.scroll--prev-all');
            /**
             * кнопка перехода к следующей странице
             * @type {HTMLButtonElement} _btnNext
             * @private
             */
            this._btnNext = this._pageNumbers.querySelector('.scroll--next');
            /**
             * кнопка перехода к последней странице
             * @type {HTMLButtonElement} _btnNextAll
             * @private
             */
            this._btnNextAll = this._pageNumbers.querySelector('.scroll--next-all');
            /**
             * блок поиска
             * @type {HTMLElement} _searchBlock
             * @private
             */
            this._searchBlock = document.querySelector('.product-search');
            /**
             * инпут поиска
             * @type {HTMLInputElement} _searchInput
             * @private
             */
            this._searchInput = this._searchBlock.querySelector('.input-search');
            /**
             * ячейки шапки таблицы
             * @type {HTMLElement} _headerCells
             * @private
             */
            this._headerCells = this._header.querySelector('.table-string');
            /**
             * блок дополнительной информации
             * @type {HTMLElement} _popupBlock
             * @private
             */
            this._popupBlock = document.querySelector('.popup-block');
            /**
             * блок ошибки загрузки данных
             * @type {HTMLElement} _errorBlock
             * @private
             */
            this._errorBlock = document.querySelector('.error-block');
            /**
             * объект с массивами данных на все страницы
             * @type {HTMLElement} _pageDataObj
             * @private
             */
            this._pageDataObj = {};
            /**
             * номер страницы
             * @type {number} _page
             * @private
             */
            this._page = 0;
            /**
             * тип сортировки
             * @type {string|boolean} _sortUp
             * @private
             */
            this._sortUp = CONSTANTS.defState;
            this._initJson();
            this._initEvents();
        }
        /**
         * получаю объект, в котором каждой странице будет соответствовать определенный массив
         * по 10 элементов в каждом
         * @param {IJsonElem[]} jsonData полученный массив данных
         * @private
         * @returns {boolean|void}
         */
        Table.prototype._getTablePages = function (jsonData) {
            var _this = this;
            var pageArr = [], pageNumber, index, isLastPage;
            // если длина пришедшего массива данных равно нулю, то возвращаю false
            if (!jsonData.length) {
                this._pageDataObj = {};
                return false;
            }
            // заполняю массив, исходя из условий
            jsonData.forEach(function (element, i) {
                pageArr.push(element);
                // определяю последняя ли это страница массива
                isLastPage = (i + 1 === jsonData.length);
                // если длина полученного массива равна условию отображения данных на одной странице
                // или индекс равен длине пришедшего массива, то записываю массив в объект и обнуляю этот массив
                if (pageArr.length === CONSTANTS.arrLength || isLastPage) {
                    index = i.toString();
                    // если длина индекса больше 1, то режу массив для получения номера массива объекта
                    // номер массива объекта равен: (длина строки индекса - 1)
                    // если меньше, то это нулевой массив объекта
                    pageNumber = index.length > 1 ? index.slice(0, index.length - 1) : '0';
                    // если страница последняя, то записываю номер страницы в переменную
                    if (isLastPage) {
                        _this._lastPage = parseInt(pageNumber);
                    }
                    // записываю массив в объект под номером страницы
                    _this._pageDataObj[pageNumber] = pageArr;
                    // обнуляю полученный массив
                    pageArr = [];
                }
            });
        };
        /**
         * заполняю тело таблицы и отрисовываю полученные данные
         * @private
         * @returns {void}
         */
        Table.prototype._fillTableBody = function () {
            var _this = this;
            var _a;
            var tableElement, market;
            // очищаю тело таблицы
            this._body.innerHTML = '';
            // проверяю наличие поля в объекте, если он есть, то прохожусь по его элементам, заполняю данными
            // и отрисовываю на странице
            (_a = this._pageDataObj[this._page]) === null || _a === void 0 ? void 0 : _a.forEach(function (element) {
                tableElement = _this._tableStrTemplate.cloneNode(true);
                market = tableElement.querySelector('.table-cell__market');
                // задаю data-атрибуты для клетки market
                market.dataset.popupId = element.id.toString();
                market.dataset.popupName = element.productName;
                market.dataset.popupPrice = element.price.toString();
                market.dataset.popupLife = element.shelfLife;
                market.dataset.popupMarket = element.market;
                tableElement.querySelector('.table-cell__id').textContent = element.id.toString();
                tableElement.querySelector('.table-cell__name').textContent = element.productName;
                tableElement.querySelector('.table-cell__price').textContent = element.price + CONSTANTS.rubles;
                tableElement.querySelector('.table-cell__shelf-life').textContent = element.shelfLife;
                tableElement.querySelector('.table-cell__market').textContent = element.market;
                _this._body.appendChild(tableElement);
            });
        };
        /**
         * пагинация
         * @param {number} pageNumber переданный номер страницы
         * @private
         * @returns {void}
         */
        Table.prototype._changePage = function (pageNumber) {
            var newPage = pageNumber - 1, isPgLast = this._lastPage === newPage;
            // состояние отображения кнопок быстрого перемещения пагинации
            // левые кнопки
            this._toggleBtns(!newPage, true);
            // правые кнопки
            this._toggleBtns(isPgLast, false);
            // задаю значения и отображаемый текст кнопкам с номерами страниц
            // первая кнопка
            this._pagBtnFirst.value = "" + (pageNumber - 1);
            this._pagBtnFirst.innerText = "" + (pageNumber - 1);
            // вторая кнопка
            this._pagBtnSecond.value = "" + pageNumber;
            this._pagBtnSecond.innerText = "" + pageNumber;
            // третья кнопка
            this._pagBtnThird.value = "" + (pageNumber + 1);
            this._pagBtnThird.innerText = "" + (pageNumber + 1);
            // задаю значения кнопкам перемещения
            // к следующей странице
            this._btnNext.value = "" + (pageNumber + 1);
            // к предыдущей странице
            this._btnPrev.value = "" + (pageNumber - 1);
            // задаю номер текущей страницы
            this._page = pageNumber - 1;
            this._fillTableBody();
        };
        /**
         * поиск
         * @param {Event} evt
         * @private
         * @returns {void|Function}
         *
         */
        Table.prototype._searchFunction = function (evt) {
            var _this = this;
            var value = evt.target.value.toLowerCase();
            var productName, hasMore;
            // если длина искомого слова больше 2 символов или строка поиска пуста,
            // то выполняю поиск и заполняю тело таблицы полученным массивом
            // или выполняю поиск по нажатию на enter
            if (value.length > CONSTANTS.searchLetter || !value.length || evt.keyCode === CONSTANTS.enterKeycode) {
                this._currentArr = [];
                // обнуляю объект массивов страниц
                this._pageDataObj = {};
                // если строка поиска пуста, то заполняю таблицу исходным массивом
                if (!value.length) {
                    this._sortArray(this._sourceData, true, null);
                    this._getTablePages(this._sourceData);
                    // устанавливаю первую страницу и обнуляю пагинацию
                    this._changePage(1);
                    hasMore = this._lastPage > 1;
                    // если страниц больше одной, то отрисовываю кнопки пагинации
                    this._toggleBtns(!hasMore, false);
                    // при исходном массиве, если пагинация скрыта, то отрисовываю ее
                    this._pagination.classList.remove('visually-hidden');
                    // задаю значения кнопке быстрого перемещения к последней странице
                    this._btnNextAll.value = "" + (this._lastPage + 1);
                    return this._fillTableBody();
                }
                // происходит поиск по исходному массиву
                this._sourceData.forEach(function (el) {
                    productName = el.productName.toLowerCase();
                    // если введенные данные существуют в массиве,
                    // то записываю найденный элемент в текущий массив
                    if (productName.indexOf(value) + 1) {
                        _this._currentArr.push(el);
                    }
                });
                this._getTablePages(this._currentArr);
                this._changePage(1);
                hasMore = this._lastPage < 1 || !this._currentArr.length;
                // если страница одна или данных нет, то скрываю пагинацию
                this._pagination.classList.toggle('visually-hidden', hasMore);
                this._btnNextAll.value = "" + (this._lastPage + 1);
                return this._fillTableBody();
            }
        };
        /**
         * сортировка массива данных
         * @param {IJsonElem[]} data
         * @param {boolean} toggleClasses условие выполнения сброса отображения сортировки
         * @param {string} value передаваемое значение нажатой ячейки
         * @private
         * @returns {void}
         */
        Table.prototype._sortArray = function (data, toggleClasses, value) {
            var _this = this;
            // a - первый сравниваемый объект
            // b - второй сравниваемый объект
            data.sort(function (a, b) {
                var aValue = a[value], bValue = b[value];
                var isFiniteNumber = Number.isFinite(aValue);
                // если сортировка по дате
                if (value === 'shelfLife') {
                    aValue = _this._getFormattedDate(aValue);
                    bValue = _this._getFormattedDate(bValue);
                }
                switch (_this._sortUp) {
                    case true:
                        // возвращение к исходному состоянию сортировки при удалении данных 
                        // из строки поиска
                        _this._resetSort(toggleClasses);
                        // сортировка от большего к меньшему
                        // проверка сортировки по числам
                        if (isFiniteNumber) {
                            return bValue - aValue;
                        }
                        // сортировка по алфавиту 
                        return aValue > bValue ? -1 : 1;
                    case false:
                        _this._resetSort(toggleClasses);
                        // сортировка от меньшего к большему
                        if (isFiniteNumber) {
                            return aValue - bValue;
                        }
                        return aValue < bValue ? -1 : 1;
                    case CONSTANTS.defState:
                        // сортировка по id от меньшего к большему
                        return a.id - b.id;
                }
            });
        };
        /**
         * выставляю правильную дату в нужном формате: ДД.ММ.ГГ
         * @param {string} dateString дата
         * @private
         * @returns {Date}
         */
        Table.prototype._getFormattedDate = function (dateString) {
            var dateArr = dateString.split('.'), date = dateArr[1] + "." + dateArr[0] + "." + dateArr[2];
            return new Date(date);
        };
        /**
         * сортировка
         * @param {Event} evt
         * @private
         * @returns {void|boolean}
         */
        Table.prototype._tableSortBy = function (evt) {
            var 
            // если в строке поиска есть данные, то сортируемые данные - полученный массив при поиске
            // если пусто, то сортируется исходный массив
            data = this._searchInput.value ? this._currentArr : this._sourceData, target = evt.target, value = target.getAttribute('value');
            // если клик по первой ячейке или по бордеру шапки, то сортировка не происходит
            if (target.classList.contains('table-cell__id') || target.classList.contains('table-string')) {
                return false;
            }
            // удаление признаков сортировки у активной ячейки, 
            // если клик произошел по неактивной ячейке
            this._resetSort(this._sortedColumn && target !== this._sortedColumn);
            // записываем в this нажатую ячейку
            this._sortedColumn = target;
            // добавление класса с картинкой направления сортировки при нажатии
            switch (this._sortUp) {
                case true:
                    // при нажатии устанавливается состояние "от меньшего к большему"
                    this._sortUp = false;
                    target.classList.remove('up');
                    target.classList.add('down');
                    break;
                case false:
                    // при нажатии устанавливается состояние "без сортировки"
                    this._sortUp = CONSTANTS.defState;
                    target.classList.remove('down');
                    target.classList.add('def');
                    // сбрасываем показания нажатой ячейки, потому что сортировки нет
                    this._sortedColumn = null;
                    break;
                case CONSTANTS.defState:
                    // при нажатии устанавливается состояние "от большего к меньшему"
                    this._sortUp = true;
                    target.classList.remove('def');
                    target.classList.add('up');
                    break;
            }
            this._sortArray(data, false, value);
            this._getTablePages(data);
            this._changePage(1);
            return this._fillTableBody();
        };
        /**
         * сброс сортировки
         * @param {boolean} toggleClasses условие, при котором сортировка сбрасывается
         * @private
         * @returns {void}
         */
        Table.prototype._resetSort = function (toggleClasses) {
            if (toggleClasses) {
                this._sortUp = CONSTANTS.defState;
                this._sortedColumn.classList.remove('up');
                this._sortedColumn.classList.remove('down');
                this._sortedColumn.classList.add('def');
            }
        };
        /**
         * всплываемое окно при клике
         * @param {Event} evt
         * @private
         * @returns {void}
         */
        Table.prototype._showPopup = function (evt) {
            var target = evt.target, id = target.dataset.popupId, name = target.dataset.popupName, price = target.dataset.popupPrice, life = target.dataset.popupLife, market = target.dataset.popupMarket;
            this._popupBlock.querySelector('.table-cell__id').textContent = id;
            this._popupBlock.querySelector('.table-cell__name').textContent = name;
            this._popupBlock.querySelector('.table-cell__price').textContent = price;
            this._popupBlock.querySelector('.table-cell__shelf-life').textContent = life;
            this._popupBlock.querySelector('.table-cell__market').textContent = market;
            // если клик происходит по клетке, у которой есть data-атрибут id, то удаляю 
            // класс у всплывающего окна, если нет - добавляю
            this._popupBlock.classList.toggle('hidden', !id);
        };
        /**
         * переключение видимости кнопок быстрого перемещения пагинации
         * @param {boolean} isToggle выбираем состояние кнопок - отображение/скрытие
         * @param {boolean} isPrev выбираем, какие кнопки будут скрыты - назад или вперед
         * @private
         * @returns {void}
         */
        Table.prototype._toggleBtns = function (isToggle, isPrev) {
            (isPrev ? this._pagBtnFirst : this._pagBtnThird).classList.toggle('visually-hidden', isToggle);
            (isPrev ? this._btnPrev : this._btnNext).classList.toggle('visually-hidden', isToggle);
            (isPrev ? this._btnPrevAll : this._btnNextAll).classList.toggle('visually-hidden', isToggle);
        };
        /**
         * инициализация иветов
         * @private
         * @returns {void}
         */
        Table.prototype._initEvents = function () {
            var _this = this;
            this._searchInput.addEventListener('input', this._searchFunction.bind(this));
            // для совершению поиска по enter
            this._searchInput.addEventListener('keydown', this._searchFunction.bind(this));
            this._pageNumbers.addEventListener('click', function (evt) {
                var target = evt.target, 
                // получаю значение нажатой кнопки
                page = parseInt(target.value);
                // если клик не по кнопкам пагинации или по текущей странице, то ничего не происходит
                if ((target.tagName.toLowerCase() !== 'button') || page === _this._page + 1) {
                    return;
                }
                _this._changePage(page);
            });
            this._headerCells.addEventListener('mousedown', this._tableSortBy.bind(this));
            document.addEventListener('click', this._showPopup.bind(this));
        };
        /**
         * получение данных с сервера
         * @private
         * @returns {void}
         */
        Table.prototype._initJson = function () {
            var _this = this;
            fetch(CONSTANTS.url).then(function (ans) {
                var data = ans.json();
                data.then(function (dataArr) {
                    // если данные получены - отрисовываю таблицу
                    _this._searchBlock.classList.remove('hidden');
                    _this._pagination.classList.remove('hidden');
                    // изначально скрываю левые кнопки быстрого перемещения пагинации
                    _this._toggleBtns(true, true);
                    _this._sourceData = dataArr;
                    _this._getTablePages(dataArr);
                    _this._fillTableBody();
                    // задаю значения быстрого перемещения 
                    // к первой странице
                    _this._btnPrevAll.value = '1';
                    // к последней странице
                    _this._btnNextAll.value = "" + (_this._lastPage + 1);
                }).catch(function () {
                    _this._errorBlock.classList.remove('hidden');
                });
            }).catch(function () {
                _this._errorBlock.classList.remove('hidden');
            });
        };
        return Table;
    }());
    new Table();
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLENBQUM7SUFDRSxJQUFNLFNBQVMsR0FBWTtRQUN4QixHQUFHLEVBQUUsd0NBQXdDO1FBQzdDLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE1BQU0sRUFBRSxJQUFJO1FBQ1osU0FBUyxFQUFFLEVBQUU7UUFDYixZQUFZLEVBQUUsQ0FBQztRQUNmLFlBQVksRUFBRSxFQUFFO0tBQ2xCLENBQUM7SUFFRjtRQXlLRztZQXhLQTs7OztlQUlHO1lBQ0ssWUFBTyxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXZFOzs7O2VBSUc7WUFDSyxVQUFLLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFbkU7Ozs7ZUFJRztZQUNLLGdCQUFXLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFekU7Ozs7ZUFJRztZQUNLLGlCQUFZLEdBQWdCLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFdkY7Ozs7ZUFJRztZQUNLLHNCQUFpQixHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWpGOzs7O2VBSUc7WUFDSyxpQkFBWSxHQUFzQixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVwRjs7OztlQUlHO1lBQ0ssa0JBQWEsR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEY7Ozs7ZUFJRztZQUNLLGlCQUFZLEdBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBGOzs7O2VBSUc7WUFDSyxhQUFRLEdBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFD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