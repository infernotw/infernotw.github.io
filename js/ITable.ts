export interface IOptions {
   url: string;
   countAtPage: string;
}

export interface IConsts {
   url: string;
   urlJson: string;
   defState: string;
   rubles: string;
   searchLetter: number;
   enterKeycode: number;
   countAtPage: string;
}

export interface IJsonElem {
   id: number;
   productName: string;
   price: number;
   shelfLife: string;
   market: string;
}

export interface IPageObj {
   [index: string]: IJsonElem[];
}