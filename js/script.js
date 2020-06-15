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
        defState: 'defState',
        rubles: ' ₽',
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
            /**
             * кнопки выбора размера отображения таблицы
             * @type {HTMLElement} _buttonSelect
             * @public
             */
            this.buttonSelect = document.querySelector('select');
            /**
             * размер массива, отображаемого на странице
             * @type {string} _arrLength
             * @public
             */
            this.arrLength = this.buttonSelect.value;
            this.dataSelect = document.querySelector('.change-json');
            this.dataJsonId = 'table';
            this._initJson(this.dataJsonId);
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
                if (pageArr.length === parseInt(_this.arrLength) || isLastPage) {
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
         * @private
         */
        Table.prototype._selectTableSize = function (evt) {
            var target = evt.target, data = this._searchInput.value ? this._currentArr : this._sourceData;
            this.arrLength = target.value;
            this._getTablePages(data);
            this._changePage(1);
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
        Table.prototype.updateData = function (evt) {
            var value = evt.target.value.toLowerCase(), id = value;
            this._body.innerHTML = '';
            this._errorBlock.classList.add('hidden');
            this._initJson(id);
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
            this.buttonSelect.addEventListener('change', this._selectTableSize.bind(this));
            this.dataSelect.addEventListener('change', this.updateData.bind(this));
        };
        /**
         * получение данных с сервера
         * @private
         * @returns {void}
         */
        Table.prototype._initJson = function (id) {
            var _this = this;
            var urlData = "" + (CONSTANTS.url + id + '.json');
            fetch(urlData).then(function (ans) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLENBQUM7SUFDRTs7Ozs7OztPQU9HO0lBRUgsSUFBTSxTQUFTLEdBQVk7UUFDeEIsR0FBRyxFQUFFLDhCQUE4QjtRQUNuQyxRQUFRLEVBQUUsVUFBVTtRQUNwQixNQUFNLEVBQUUsSUFBSTtRQUNaLFlBQVksRUFBRSxDQUFDO1FBQ2YsWUFBWSxFQUFFLEVBQUU7S0FDbEIsQ0FBQztJQUVGO1FBMkxHO1lBMUxBOzs7O2VBSUc7WUFDSyxZQUFPLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFdkU7Ozs7ZUFJRztZQUNLLFVBQUssR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUVuRTs7OztlQUlHO1lBQ0ssZ0JBQVcsR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV6RTs7OztlQUlHO1lBQ0ssaUJBQVksR0FBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUV2Rjs7OztlQUlHO1lBQ0ssc0JBQWlCLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFakY7Ozs7ZUFJRztZQUNLLGlCQUFZLEdBQXNCLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBGOzs7O2VBSUc7WUFDSyxrQkFBYSxHQUFzQixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV0Rjs7OztlQUlHO1lBQ0ssaUJBQVksR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFcEY7Ozs7ZUFJRztZQUNLLGFBQVEsR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsZUFB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