(() => {
    interface IConsts {
        url: string;
        defState: string;
        rubles: string;
        arrLength: number;
        searchLetter: number;
        enterKeycode: number;
    }

    interface IJsonElem {
        id: number;
        productName: string;
        price: number;
        shelfLife: string;
        market: string;
    }

    interface IPageObj {
        [index: number]: IJsonElem[];
    }

    const CONSTANTS: IConsts = {
        url: 'https://infernotw.github.io/table.json',
        defState: 'defState',
        rubles: ' ₽',
        arrLength: 10,
        searchLetter: 2,
        enterKeycode: 13
    };

    class Table {
        private _header: HTMLElement = document.querySelector('.table-header');
        private _body: HTMLElement = document.querySelector('.table-body');
        private _pagination: HTMLElement = document.querySelector('.pagination');
        private _pageNumbers: HTMLElement = this._pagination.querySelector('.buttons-wrapper');
        private _tableStrTemplate: HTMLElement = document.querySelector('.table-string');
        private _pagBtnFirst: HTMLInputElement = this._pageNumbers.querySelector('.first');
        private _pagBtnSecond: HTMLInputElement = this._pageNumbers.querySelector('.second');
        private _pagBtnThird: HTMLInputElement = this._pageNumbers.querySelector('.third');
        private _btnPrev: HTMLInputElement = this._pageNumbers.querySelector('.scroll--prev');
        private _btnPrevAll: HTMLInputElement = this._pageNumbers.querySelector('.scroll--prev-all');
        private _btnNext: HTMLInputElement = this._pageNumbers.querySelector('.scroll--next');
        private _btnNextAll: HTMLInputElement = this._pageNumbers.querySelector('.scroll--next-all');
        private _searchBlock: HTMLElement = document.querySelector('.product-search');
        private _searchInput: HTMLInputElement = this._searchBlock.querySelector('.input-search');
        private _headerCells: HTMLElement = this._header.querySelector('.table-string');
        private _popupBlock: HTMLElement = document.querySelector('.popup-block');
        private _errorBlock: HTMLElement = document.querySelector('.error-block');
        private _pageDataObj: IPageObj;
        private _page: number = 0;
        private _sortUp: string | boolean = CONSTANTS.defState;;
        private _sourceData: IJsonElem[];
        private _currentArr: IJsonElem[];
        private _lastPage: number;
        private _sortedColumn: HTMLElement;

        constructor() {
            this._pageDataObj = {};

            this._initJson();
            this._initEvents();
        }

        /**
         * получаю объект, в котором каждой странице будет соответствовать определенный массив
         * по 10 элементов в каждом
         * @param jsonData полученный массив данных
         */
        _getTablePages(jsonData: IJsonElem[]): boolean | void {
            let
                pageArr: IJsonElem[] = [],
                pageNumber: string,
                index: string,
                isLastPage: boolean;

            // если длина пришедшего массива данных равно нулю, то возвращаю false
            if (!jsonData.length) {
                this._pageDataObj = {};
                return false;
            }

            // заполняю массив, исходя из условий
            jsonData.forEach((element, i) => {
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
                        this._lastPage = parseInt(pageNumber);
                    }

                    // записываю массив в объект под номером страницы
                    this._pageDataObj[pageNumber] = pageArr;
                    // обнуляю полученный массив
                    pageArr = [];
                }
            });
        }

        /**
         * заполняю тело таблицы и отрисовываю полученные данные
         */
        _fillTableBody(): void {
            let
                tableElement: any,
                market: any;

            // очищаю тело таблицы
            this._body.innerHTML = '';

            // проверяю наличие поля в объекте, если он есть, то прохожусь по его элементам, заполняю данными
            // и отрисовываю на странице
            this._pageDataObj[this._page] && this._pageDataObj[this._page].forEach(element => {
                tableElement = this._tableStrTemplate.cloneNode(true);
                market = tableElement.querySelector('.table-cell__market');

                // задаю data-атрибуты для клетки market
                market.dataset.popupId = `${element.id}`;
                market.dataset.popupName = element.productName;
                market.dataset.popupPrice = `${element.price}`;
                market.dataset.popupLife = element.shelfLife;
                market.dataset.popupMarket = element.market;

                tableElement.querySelector('.table-cell__id').textContent = element.id;
                tableElement.querySelector('.table-cell__name').textContent = element.productName;
                tableElement.querySelector('.table-cell__price').textContent = element.price + CONSTANTS.rubles;
                tableElement.querySelector('.table-cell__shelf-life').textContent = element.shelfLife;
                tableElement.querySelector('.table-cell__market').textContent = element.market;

                this._body.appendChild(tableElement);
            });
        }

        /**
         * пагинация
         * @param pageNumber переданный номер страницы
         */
        _changePage(pageNumber: number): void {
            const
                newPage = pageNumber - 1,
                isPgLast = this._lastPage === newPage;

            // состояние отображения кнопок быстрого перемещения пагинации
            // левые кнопки
            this._toggleBtns(!newPage, true);
            // правые кнопки
            this._toggleBtns(isPgLast, false);

            // задаю значения и отображаемый текст кнопкам с номерами страниц
            // первая кнопка
            this._pagBtnFirst.value = `${pageNumber - 1}`;
            this._pagBtnFirst.innerText = `${pageNumber - 1}`;

            // вторая кнопка
            this._pagBtnSecond.value = `${pageNumber}`;
            this._pagBtnSecond.innerText = `${pageNumber}`;

            // третья кнопка
            this._pagBtnThird.value = `${pageNumber + 1}`;
            this._pagBtnThird.innerText = `${pageNumber + 1}`;

            // задаю значения кнопкам перемещения
            // к следующей странице
            this._btnNext.value = `${pageNumber + 1}`;
            // к предыдущей странице
            this._btnPrev.value = `${pageNumber - 1}`;

            // задаю номер текущей страницы
            this._page = pageNumber - 1;

            this._fillTableBody();
        }

        /**
         * поиск
         * @param evt 
         */
        _searchFunction(evt: KeyboardEvent): void {
            const value = (evt.target as HTMLInputElement).value.toLowerCase();
            let
                productName: string,
                hasMore: boolean;

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
                    this._btnNextAll.value = `${this._lastPage + 1}`;

                    return this._fillTableBody();
                }

                // происходит поиск по исходному массиву
                this._sourceData.forEach(el => {
                    productName = el.productName.toLowerCase();

                    // если введенные данные существуют в массиве,
                    // то записываю найденный элемент в текущий массив
                    if (productName.indexOf(value) + 1) {
                        this._currentArr.push(el);
                    }
                });

                this._getTablePages(this._currentArr);
                this._changePage(1);

                hasMore = this._lastPage < 1 || !this._currentArr.length;

                // если страница одна или данных нет, то скрываю пагинацию
                this._pagination.classList.toggle('visually-hidden', hasMore);

                this._btnNextAll.value = `${this._lastPage + 1}`;

                return this._fillTableBody();
            }
        }

        /**
         * сортировка массива данных
         * @param data 
         * @param toggleClasses условие выполнения сброса отображения сортировки
         * @param value передаваемое значение нажатой ячейки
         */
        _sortArray(data: IJsonElem[], toggleClasses: boolean, value: string): void {
            // a - первое сравниваемое число
            // b - второе сравниваемое число
            data.sort((a, b) => {
                let
                    aValue = a[value],
                    bValue = b[value];
                const isFiniteNumber = Number.isFinite(aValue);

                // если сортировка по дате
                if (value === 'shelfLife') {
                    aValue = this._getFormattedDate(aValue);
                    bValue = this._getFormattedDate(bValue);
                }

                switch (this._sortUp) {
                    case true:
                        // возвращение к исходному состоянию сортировки при удалении данных 
                        // из строки поиска
                        this._resetSort(toggleClasses);

                        // сортировка от большего к меньшему
                        // проверка сортировки по числам
                        if (isFiniteNumber) {
                            return bValue - aValue;
                        }

                        // сортировка по алфавиту 
                        return aValue > bValue ? -1 : 1;
                    case false:
                        this._resetSort(toggleClasses);

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
        }

        /**
         * выставляю правильную дату в нужном формате: ДД.ММ.ГГ
         * @param dateString дата
         */
        _getFormattedDate(dateString: string): Date {
            const
                dateArr: string[] = dateString.split('.'),
                date = `${dateArr[1]}.${dateArr[0]}.${dateArr[2]}`;

            return new Date(date);
        }

        /**
         * сортировка
         * @param evt 
         */
        _tableSortBy(evt: Event): void | boolean {
            const
                // если в строке поиска есть данные, то сортируемые данные - полученный массив при поиске
                // если пусто, то сортируется исходный массив
                data = this._searchInput.value ? this._currentArr : this._sourceData,
                target = evt.target as HTMLInputElement,
                value = target.getAttribute('value');

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
        }

        /**
         * сброс сортировки
         * @param toggleClasses условие, при котором сортировка сбрасывается
         */
        _resetSort(toggleClasses: boolean): void {
            if (toggleClasses) {
                this._sortUp = CONSTANTS.defState;
                this._sortedColumn.classList.remove('up');
                this._sortedColumn.classList.remove('down');
                this._sortedColumn.classList.add('def');
            }
        }

        /**
         * всплываемое окно при клике
         * @param evt 
         */
        _showPopup(evt: Event): void {
            const
                target = evt.target as HTMLInputElement,
                id = target.dataset.popupId,
                name = target.dataset.popupName,
                price = target.dataset.popupPrice,
                life = target.dataset.popupLife,
                market = target.dataset.popupMarket;

            this._popupBlock.querySelector('.table-cell__id').textContent = id;
            this._popupBlock.querySelector('.table-cell__name').textContent = name;
            this._popupBlock.querySelector('.table-cell__price').textContent = price;
            this._popupBlock.querySelector('.table-cell__shelf-life').textContent = life;
            this._popupBlock.querySelector('.table-cell__market').textContent = market;

            // если клик происходит по клетке, у которой есть data-атрибут id, то удаляю 
            // класс у всплывающего окна, если нет - добавляю
            this._popupBlock.classList.toggle('hidden', !id);
        }

        /**
         * переключение видимости кнопок быстрого перемещения пагинации
         * @param isToggle выбираем состояние кнопок - отображение/скрытие
         * @param isPrev выбираем, какие кнопки будут скрыты - назад или вперед
         */
        _toggleBtns(isToggle: boolean, isPrev: boolean): void {
            (isPrev ? this._pagBtnFirst : this._pagBtnThird).classList.toggle('visually-hidden', isToggle);
            (isPrev ? this._btnPrev : this._btnNext).classList.toggle('visually-hidden', isToggle);
            (isPrev ? this._btnPrevAll : this._btnNextAll).classList.toggle('visually-hidden', isToggle);
        }

        _initEvents(): void {
            this._searchInput.addEventListener('input', this._searchFunction.bind(this));
            // для совершению поиска по enter
            this._searchInput.addEventListener('keydown', this._searchFunction.bind(this));
            this._pageNumbers.addEventListener('click', (evt) => {
                const
                    target = evt.target as HTMLInputElement,
                    // получаю значение нажатой кнопки
                    page = parseInt(target.value);

                // если клик не по кнопкам пагинации или по текущей странице, то ничего не происходит
                if ((target.tagName.toLowerCase() !== 'button') || page === this._page + 1) {
                    return;
                }

                this._changePage(page);
            });
            this._headerCells.addEventListener('mousedown', this._tableSortBy.bind(this));
            document.addEventListener('click', this._showPopup.bind(this));
        }

        _initJson(): void {
            fetch(CONSTANTS.url).then(ans => {
                const data = ans.json();

                data.then(dataArr => {
                    // если данные получены - отрисовываю таблицу
                    this._searchBlock.classList.remove('hidden');
                    this._pagination.classList.remove('hidden');

                    // изначально скрываю левые кнопки быстрого перемещения пагинации
                    this._toggleBtns(true, true);

                    this._sourceData = dataArr;
                    this._getTablePages(dataArr);
                    this._fillTableBody();

                    // задаю значения быстрого перемещения 
                    // к первой странице
                    this._btnPrevAll.value = '1';
                    // к последней странице
                    this._btnNextAll.value = `${this._lastPage + 1}`;
                }).catch(() => {
                    this._errorBlock.classList.remove('hidden');
                });
            }).catch(() => {
                this._errorBlock.classList.remove('hidden');
            });
        }
    }

    new Table();
})();