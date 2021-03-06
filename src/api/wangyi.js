import request from '@/utils/request';
import axios from 'axios';

const BASE = 'http://67.216.223.155:3000';

export function getBanner (params) {
    return request({
        url: BASE + '/banner',
        method: 'get',
        params
    })
}

export function getPersonalized (params) {
    return request({
        url: BASE + '/personalized',
        method: 'get',
        params
    })
}

export function getRecommonData (apiNames) {
    var api = {
            personalizedData: getBanner(),
            bannerData: getPersonalized()
        },
        apiNames = apiNames || ['personalizedData', 'bannerData'],
        apiArr = apiNames.map(item => api[item]);

    return axios.all(apiArr).then(axios.spread(function (banner, personalized) {
        return Promise.resolve([banner, personalized])
    })).catch(err => {
        return Promise.reject(err)
    })
}

export function getPlayList (id) {
    return request({
        url: BASE + '/playlist/detail',
        method: 'get',
        params: {
            id,
            t: Date.now()
        }
    })
}

export function getMusicUrl (id) {
    return request({
        url: BASE + '/song/url',
        method: 'get',
        params: {
            id
        }
    })
}

export function getLyric (id) {
    return request({
        url: BASE + '/lyric',
        method: 'get',
        params: {
            id
        }
    })
}