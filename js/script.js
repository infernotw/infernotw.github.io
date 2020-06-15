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
    var data = document.querySelector('.change-data'), arrLength = document.querySelector('.change-size'), selectData = data.querySelector('select'), selectLength = arrLength.querySelector('select');
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
            var pageArr = [], isLastPage;
            var pageNumber = 0;
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
                // при компиляции выдает ошибку, фиксится QuickFix'ом
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
            if (!!(this._sortUp !== CONSTANTS.defState)) {
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
    selectData.addEventListener('change', function (evt) {
        evt.stopPropagation();
        var url = CONSTANTS.url + evt.target.value + CONSTANTS.urlJson;
        tableArea.updateData(url);
    });
    selectLength.addEventListener('change', function (evt) {
        evt.stopPropagation();
        tableArea.selectTableSize(evt.target.value);
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLENBQUM7SUFDRTs7Ozs7OztPQU9HO0lBRUgsSUFBTSxTQUFTLEdBQVk7UUFDeEIsR0FBRyxFQUFFLDhCQUE4QjtRQUNuQyxPQUFPLEVBQUUsT0FBTztRQUNoQixRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsSUFBSTtRQUNaLFlBQVksRUFBRSxDQUFDO1FBQ2YsWUFBWSxFQUFFLEVBQUU7UUFDaEIsV0FBVyxFQUFFLElBQUk7S0FDbkIsQ0FBQztJQUVGLElBQ0csSUFBSSxHQUFnQixRQUFRLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUMxRCxTQUFTLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQy9ELFVBQVUsR0FBc0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDNUQsWUFBWSxHQUFzQixTQUFTLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXZFO1FBZ0xHLGVBQVksT0FBaUI7WUEvSzdCOzs7O2VBSUc7WUFDSyxZQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFdkU7Ozs7ZUFJRztZQUNLLFVBQUssR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVuRTs7OztlQUlHO1lBQ0ssZ0JBQVcsR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV6RTs7OztlQUlHO1lBQ0ssaUJBQVksR0FBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUV2Rjs7OztlQUlHO1lBQ0ssc0JBQWlCLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFakY7Ozs7ZUFJRztZQUNLLGlCQUFZLEdBQXNCLElBQUksQ0FB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