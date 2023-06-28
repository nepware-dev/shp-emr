import commonConfig from './config.common';

export default {
    ...commonConfig,

    tier: 'production',
    baseURL: 'https://shp.dev.nepware.io/v/r4',
    sdcIdeUrl: 'https://sdc.beda.software',
    aiQuestionnaireBuilderUrl: 'https://builder.emr.beda.software',

    webSentryDSN: null,
    mobileSentryDSN: null,
    jitsiMeetServer: 'video.emr.beda.software/',
    wearablesDataStreamService: 'https://ingest.emr.beda.software',
};
