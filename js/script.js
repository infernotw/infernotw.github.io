(function () {
    /**
     * @see
     * используется два класса 'visually-hidden' и 'hidden'
     * 'visually-hidden' - делает блок невидимым с сохранением места для элемента,
     * это необходимо для скрытия кнопок пагинации
     * 'hidden' - скрывает блок полностью, необходим для скрытия всплывающего окна
     * Так как это не сборка, то нужен JS, чтобы .io не падало, и TS - для ревью    *
     */
    var CONSTANTS = {
        url: 'https://infernotw.github.io/',
        urlJson: '.json',
        defState: 'defState',
        rubles: ' ₽',
        searchLetter: 2,
        enterKeycode: 13,
        countAtPage: '10'
    };
    var dataChanger = document.querySelector('.data-changer'), sizeChanger = document.querySelector('.size-changer');
    var Table = /** @class */ (function () {
        function Table(options) {
            /**
             * шапка таблицы
             * @type {HTMLElement} _header
             * @private
             */
            this._header = document.querySelector('.table-header');
            /**
             * тело таблицы
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
            this._arrLength = options.countAtPage.toString() || CONSTANTS.countAtPage;
            this._initJson(options.url);
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
            var pageArr = [], isLastPage, pageNumber = 0;
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
                if (pageArr.length === parseInt(_this._arrLength) || isLastPage) {
                    // записываю массив в объект под номером страницы
                    _this._pageDataObj[pageNumber] = pageArr;
                    // увеличиваю номер страницы после записи в объект
                    pageNumber++;
                    // если страница последняя, то записываю номер страницы в переменную
                    if (isLastPage) {
                        _this._lastPage = pageNumber - 1;
                    }
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
         * выбор размера отображения
         * @param {Event} evt
         * @public
         */
        Table.prototype.selectTableSize = function (arrLength) {
            var data = this._searchInput.value ? this._currentArr : this._sourceData;
            this._arrLength = arrLength;
            this._changePage(1);
            this._getTablePages(data);
            this._btnNextAll.value = "" + (this._lastPage + 1);
            this._fillTableBody();
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
            this._pagBtnFirst.value = "" + newPage;
            this._pagBtnFirst.innerText = "" + newPage;
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
            this._btnPrev.value = "" + newPage;
            // задаю номер текущей страницы
            this._page = newPage;
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
                // при компиляции выдает ошибку, TS не в курсе про isFinite
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
         * обновление БД для отрисовки на странице
         * @param {string} url ссылка на БД
         * @public
         */
        Table.prototype.updateData = function (url) {
            this._changePage(1);
            this._searchInput.value = '';
            this._pagination.classList.remove('visually-hidden');
            this._initJson(url);
            if (this._sortUp !== CONSTANTS.defState) {
                this._resetSort(true);
                this._sortedColumn = null;
            }
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
        Table.prototype._initJson = function (url) {
            var _this = this;
            fetch(url).then(function (ans) {
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
                    _this._errorBlock.classList.add('hidden');
                }).catch(function () {
                    _this._errorBlock.classList.remove('hidden');
                    _this._searchBlock.classList.add('hidden');
                    _this._pagination.classList.add('hidden');
                    _this._body.innerHTML = '';
                    _this._sourceData = [];
                });
            }).catch(function () {
                _this._errorBlock.classList.remove('hidden');
                _this._searchBlock.classList.add('hidden');
                _this._pagination.classList.add('hidden');
                _this._body.innerHTML = '';
                _this._sourceData = [];
            });
        };
        return Table;
    }());
    var tableArea = new Table({
        url: CONSTANTS.url + 'table' + CONSTANTS.urlJson,
        countAtPage: '10'
    });
    dataChanger.addEventListener('change', function (evt) {
        evt.stopPropagation();
        var url = CONSTANTS.url + evt.target.value + CONSTANTS.urlJson;
        tableArea.updateData(url);
    });
    sizeChanger.addEventListener('change', function (evt) {
        evt.stopPropagation();
        tableArea.selectTableSize(evt.target.value);
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLENBQUM7SUFDRTs7Ozs7OztPQU9HO0lBRUgsSUFBTSxTQUFTLEdBQVk7UUFDeEIsR0FBRyxFQUFFLDhCQUE4QjtRQUNuQyxPQUFPLEVBQUUsT0FBTztRQUNoQixRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsSUFBSTtRQUNaLFlBQVksRUFBRSxDQUFDO1FBQ2YsWUFBWSxFQUFFLEVBQUU7UUFDaEIsV0FBVyxFQUFFLElBQUk7S0FDbkIsQ0FBQztJQUVGLElBQ0csV0FBVyxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxFQUN4RSxXQUFXLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDNUU7UUFnTEcsZUFBWSxPQUFpQjtZQS9LN0I7Ozs7ZUFJRztZQUNLLFlBQU8sR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV2RTs7OztlQUlHO1lBQ0ssVUFBSyxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5FOzs7O2VBSUc7WUFDSyxnQkFBVyxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXpFOzs7O2VBSUc7WUFDSyxpQkFBWSxHQUFnQixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXZGOzs7O2VBSUc7WUFDSyxzQkFBaUIsR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUVqRjs7OztlQUlHO1lBQ0ssaUJBQVksR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEY7Ozs7ZUFJRztZQUNLLGtCQUFhLEdBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxD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