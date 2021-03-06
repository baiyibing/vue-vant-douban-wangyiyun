<template>
    <transition name="slide" mode="out-in">
        <div class="movie-detail" v-show="visible" ref="movieDetail">
            <top-header @back="hide">
                <i class="movie-icon iconfont icon-dianying"></i>电影
            </top-header>

            <div class="poster-wrap">
                <img class="poster" v-lazy="movie.images && movie.images.medium">
            </div>

            <movie-info :detail-data="detailData"></movie-info>

            <operate :detail-data="detailData"></operate>

            <section class="summary-wrap van-hairline--top">
                <h3 class="title">剧情简介</h3>
                <div class="content">
                    &nbsp;&nbsp;&nbsp;&nbsp;{{ summary }}
                    <span class="btn" @click="isSummaryExpand = true" v-show="!isSummaryExpand">(展开)</span>
                </div>
            </section>

            <section class="casts-wrap van-hairline--top" v-show="directorsAndActors.length">
                <h3 class="title">影人</h3>
                <ul class="casts-list">
                    <li class="cast-item" v-for="cast of directorsAndActors" :key="cast.id" @click="handleCastSelect(cast)">
                        <img v-lazy="cast.avatars && cast.avatars.small" width="90" height="120">
                        <div class="name van-ellipsis">{{ cast.name }}</div>
                        <div class="role">{{ cast.isDirector ? '导演' : '演员' }}</div>
                    </li>
                </ul>
            </section>

            <movie-comment v-show="detailData.popular_comments" :comments="detailData.popular_comments" :reviews="detailData.popular_reviews"></movie-comment>

            <my-loading size="medium" color="black" top="44" v-model="loading"></my-loading>
        </div>
    </transition>
</template>

<script>
import { getMovieDetail } from '@/api/douban';
import populMixin from '@/mixins/popup';
import Operate from './components/Operate';
import MovieInfo from './components/MovieInfo';
import MovieComment from './components/MovieComment';
import TopHeader from '@/components/header';

const SUMMARY_TEXT_NUM = 65

export default {
    name: 'MovieDetail',

    mixins: [ populMixin ],

    components: { Operate, MovieInfo, MovieComment, TopHeader },

    props: {
        movie: {
            type: Object,
            default () { return {} }
        }
    },

    computed: {
        summary () {
            let summary = this.detailData.summary;
            if (!summary) return;
            if (!this.isSummaryExpand) {
                return summary.slice(0, SUMMARY_TEXT_NUM) + '...';
            } else {
                return summary;
            }
        }
    },

    data () {
        return {
            wantSee: false,
            hasSee: false,
            detailData: {},
            loading: false,
            directorsAndActors: [],
            isSummaryExpand: false,
            movieObj: null,
            castDetailComp: null,
            selectedCast: {}
        }
    },

    methods: {
        getDetail () {
            this.loading = true;
            return getMovieDetail(this.movie.id).then(res => {
                this.detailData = res;
                this.loading = false;
            })
        },

        // 合并导演和演员
        setDirectorsAndActors () {
            let detailData = this.detailData;
            let directorsWithMark = detailData.directors.map(item => {
                item.isDirector = true;
                return item;
            })
            this.directorsAndActors = [...directorsWithMark, ...detailData.casts];
        },

        handleCastSelect(cast) {
            this.selectedCast = cast;
            this.showCastDetail();
        },

        showCastDetail () {

            // 调用castDetail组件api
            this.castDetailComp = this.castDetailComp || this.$createCastDetail({
                $props: {
                    cast: 'selectedCast'
                }
            })
            this.castDetailComp.show()
            this.$nextTick(_ => {
                this.castDetailComp.init()
            })
        },

        async init () {

            // 初始化滚动条与数据
            this.$refs.movieDetail.scrollTop = 0;
            this.detailData = {};
            this.directorsAndActors = [];
            await this.getDetail();
            this.setDirectorsAndActors();
            this.isSummaryExpand = this.detailData.summary.length < SUMMARY_TEXT_NUM; // 初始化剧情简介是否显示展开按钮
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../scss/mixin';
$poster-bg: #555;

.slide-enter-active, .slide-leave-active {
    transition: transform .2s;
}

.slide-enter, .slide-leave-to {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
}

.movie-detail {
    @include fixedLayout;
    z-index: 2000;
}

.poster-wrap {
    padding: 50px 0 20px;
    background: $poster-bg;
    text-align: center;

    .poster {
        min-height: 250px;
        width: 50%;
    }
}

.summary-wrap {
    margin: $wrap-padding;
    padding-top: $wrap-padding;

    .title {
        margin-bottom: 10px;
        color: $gray-deep;
    }
    .content {
        font-size: 14px;
        line-height: 24px;

        .btn {
            color: $theme;
        }
    }
}

.casts-wrap {
    margin: $wrap-padding;
    padding-top: $wrap-padding;

    .title {
        margin-bottom: 10px;
        color: $gray-deep;
    }

    .casts-list {
        display: flex;
        padding-bottom: 12px;
        overflow-x: auto;
        overflow-y: hidden;

        .cast-item {
            margin-right: 10px;
            text-align: center;

            .name {
                width: 90px;
                padding: 8px 0 4px;
            }

            .role {
                color: $gray-deep;
            }
        }
    }
}
</style>
