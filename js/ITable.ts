export interface IConsts {
   url: string;
   urlJson: string;
   defState: string;
   rubles: string;
   searchLetter: number;
   enterKeycode: number;
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