import axios, { AxiosRequestConfig } from "axios";

const ENDPOINT = import.meta.env.VITE_DROPPER;
const API_KEY = import.meta.env.VITE_FUNCTION_DROPP_KEY;

export const triggerDropperProxy = async (method: string) => {
  const data = {
    dropperMethod: method,
    id: "CMS Admin",
    price: 100,
    time: new Date().toISOString(),
  };

  console.log('Endpoint is: ', ENDPOINT);
  console.log('Data being sent:', data);

  const dropperConfig: AxiosRequestConfig = {
    method: 'post',
    url: ENDPOINT,
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    data: { data },
    // Tell Axios not to throw on 4xx/5xx — return them as normal responses
    validateStatus: () => true,
  };

  try {
    const response = await axios.request(dropperConfig);
    console.log('Response received:', response.status, response.data);
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    console.error('There was an Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

const sendRequest = async (config: AxiosRequestConfig<any>) => {
    console.log('Axios Config:', config);
    try {
        const response = await axios.request(config);
        console.log('Response received:', response.data);
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error: any) {
        console.error('Request failed:', error.response ? error.response.data : error.message);
        return {
            statusCode: error.response ? error.response.status : 500,
            body: JSON.stringify({
                message: error.message,
                response: error.response ? error.response.data : null,
            }),
        };
    }
};
