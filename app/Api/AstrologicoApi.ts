import axios from "axios";
import Env from '@ioc:Adonis/Core/Env';

const AstrologicoApi = axios.create({
    baseURL: Env.get('ASTROLOGICO_API_BASE_URL'),
    headers: {
        Authorization: Env.get('ASTROLOGICO_API_KEY')
    }
})

export default AstrologicoApi