class NavigationService {
    constructor() {
      this._navigation = null;
    }
  
    set navigate(nav) {
      this._navigation = nav;
    }
  
    get navigate() {
      return this._navigation;
    }
  }
  
  const navigationService = new NavigationService();
  
  export default navigationService;