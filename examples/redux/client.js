import render from './render/client';
import routes from './routes';
import configureStore from './redux/configureStore';

const store = configureStore(__FLUX_STATE__);
render(document.getElementById('application'), routes, store);
