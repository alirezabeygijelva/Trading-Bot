import React from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Main from './Main';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailConfirmationSent from './pages/EmailConfirmationSent';
import EmailValidation from './pages/EmailValidation';
import QuickActionsContextProvider from './contexts/QuickActionsContext';
import EngineHubContextProvider from './contexts/EngineHubContext';
import LocalizationProvider from './contexts/LocalizationContext';
import ForgotPassword from './pages/ForgotPassword';
import SetPassword from './pages/SetPassword';
import ForgotPasswordEmailSent from './pages/ForgotPasswordEmailSent';
import navigationService from './services/NavigationService';
import { TooltipProvider } from 'react-tooltip';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/scss/layout.scss';
import './assets/scss/App.scss';
import RTL from './lib/RTL';
import { accountServices } from './services/AccountServices';


function App() {
  React.useEffect(() => {
    accountServices.currentUser.subscribe((user) => {
      if (user) {
        window.addEventListener('raychat_ready', function (ets) {
          window.Raychat.setUser({
            email: user.email,
            name: user.name,
            updateOnce: false
          });
        });
      }
    });
    window.addEventListener('message', (event) => {
      if (event.data === "karabot_user_logout") {
        //localStorage.removeItem('www.raychat.io');
      }
    });

  }, []);

  library.add(fas);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  React.useEffect(() => {
    navigationService.navigate = navigate;
  }, [navigate]);
  return (
    <div id="app-container">
      <LocalizationProvider>
        <RTL>
          <EngineHubContextProvider>
            <QuickActionsContextProvider>
              <TooltipProvider>
                <Tooltip target=".customClassName" mouseTrack mouseTrackLeft={10} />
                {/* <Router history={history}> */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<PrivateRoute path="/login" />} >
                    <Route path="/login" element={<Login />} />
                  </Route>
                  <Route path="/register" element={<PrivateRoute path="/register" />} >
                    <Route path="/register" element={<Register />} />
                  </Route>
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/setpassword" element={<SetPassword />} />
                  <Route path="/setpassword/:q" element={<SetPassword />} />
                  <Route path="/forgotpasswordemailsent" element={<ForgotPasswordEmailSent />} />
                  <Route path="/forgotpasswordemailsent/:email" element={<ForgotPasswordEmailSent />} />
                  <Route path="/emailconfirmationsent" element={<EmailConfirmationSent />} />
                  <Route path="/emailconfirmationsent/:email" element={<EmailConfirmationSent />} />
                  <Route path="/emailvalidation" element={<EmailValidation />} />
                  <Route path="/emailvalidation/:q" element={<EmailValidation />} />
                  <Route path="*" element={<PrivateRoute />} >
                    <Route path="*" element={<Main pathName={pathname} />} />
                  </Route>
                </Routes>
              </TooltipProvider>
            </QuickActionsContextProvider>
          </EngineHubContextProvider>
        </RTL>
      </LocalizationProvider>
    </div>
  );
}
export default App;
