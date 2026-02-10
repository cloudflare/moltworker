<page>
---
title: Overview · Cloudflare Stream docs
description: Cloudflare Stream lets you or your end users upload, store, encode,
  and deliver live and on-demand video with one API, without configuring or
  maintaining infrastructure.
lastUpdated: 2025-03-14T16:33:10.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/
  md: https://developers.cloudflare.com/stream/index.md
---

Serverless live and on-demand video streaming

Cloudflare Stream lets you or your end users upload, store, encode, and deliver live and on-demand video with one API, without configuring or maintaining infrastructure.

You can use Stream to build your own video features in websites and native apps, from simple playback to an entire video platform.

Cloudflare Stream runs on [Cloudflare’s global cloud network](https://www.cloudflare.com/network/) in hundreds of cities worldwide.

[Get started ](https://developers.cloudflare.com/stream/get-started/)[Stream dashboard](https://dash.cloudflare.com/?to=/:account/stream)

***

## Features

### Control access to video content

Restrict access to paid or authenticated content with signed URLs.

[Use Signed URLs](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)

### Let your users upload their own videos

Let users in your app upload videos directly to Stream with a unique, one-time upload URL.

[Direct Creator Uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/)

### Play video on any device

Play on-demand and live video on websites, in native iOS and Android apps, and dedicated streaming devices like Apple TV.

[Play videos](https://developers.cloudflare.com/stream/viewing-videos/)

### Get detailed analytics

Understand and analyze which videos and live streams are viewed most and break down metrics on a per-creator basis.

[Explore Analytics](https://developers.cloudflare.com/stream/getting-analytics/)

***

## More resources

[Discord](https://discord.cloudflare.com)

Join the Stream developer community

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Stream docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/404/
  md: https://developers.cloudflare.com/stream/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: Changelog · Cloudflare Stream docs
description: Subscribe to RSS
lastUpdated: 2025-02-13T19:35:19.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/changelog/
  md: https://developers.cloudflare.com/stream/changelog/index.md
---

[Subscribe to RSS](https://developers.cloudflare.com/stream/changelog/index.xml)

## 2025-03-12

**Stream Live WebRTC WHIP/WHEP Upgrades**

Stream Live WHIP/WHEP will be progressively migrated to a new implementation powered by Cloudflare Realtime (Calls) starting Thursday 2025-03-13. No API or integration changes will be required as part of this upgrade. Customers can expect an improved playback experience. Otherwise, this should be a transparent change, although some error handling cases and status reporting may have changed.

For more information review the [Stream Live WebRTC beta](https://developers.cloudflare.com/stream/webrtc-beta/) documentation.

## 2025-02-10

**Stream Player ad support adjustments for Google Ad Exchange Verification**

Adjustments have been made to the Stream player UI when playing advertisements called by a customer-provided VAST or VMAP `ad-url` argument:

A small progress bar has been added along the bottom of the player, and the shadow behind player controls has been reduced. These changes have been approved for use with Google Ad Exchange.

This only impacts customers using the built-in Stream player and calling their own advertisements; Stream never shows ads by default. For more information, refer to [Using the Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/#basic-options).

## 2025-01-30

**Expanded Language Support for Generated Captions**

Eleven new languages are now supported for transcription when using [generated captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/#generate-a-caption), available for free for video stored in Stream.

## 2024-08-15

**Full HD encoding for Portrait Videos**

Stream now supports full HD encoding for portrait/vertical videos. Videos with a height greater than their width will now be constrained and prepared for adaptive bitrate renditions based on their width. No changes are required to benefit from this update. For more information, refer to [the announcement](https://blog.cloudflare.com/introducing-high-definition-portrait-video-support-for-cloudflare-stream).

## 2024-08-09

**Hide Viewer Count in Live Streams**

A new property `hideLiveViewerCount` has been added to Live Inputs to block access to the count of viewers in a live stream and remove it from the player. For more information, refer to [Start a Live Stream](https://developers.cloudflare.com/stream/stream-live/start-stream-live/).

## 2024-07-23

**New Live Webhooks for Error States**

Stream has added a new notification event for Live broadcasts to alert (via email or webhook) on various error conditions including unsupported codecs, bad GOP/keyframe interval, or quota exhaustion.

When creating/editing a notification, subscribe to `live_input.errored` to receive the new event type. Existing notification subscriptions will not be changed automatically. For more information, refer to [Receive Live Webhooks](https://developers.cloudflare.com/stream/stream-live/webhooks/).

## 2024-06-20

**Generated Captions to Open beta**

Stream has introduced automatically generated captions to open beta for all subscribers at no additional cost. While in beta, only English is supported and videos must be less than 2 hours. For more information, refer to the [product announcement and deep dive](https://blog.cloudflare.com/stream-automatic-captions-with-ai) or refer to the [captions documentation](https://developers.cloudflare.com/stream/edit-videos/adding-captions/) to get started.

## 2024-06-11

**Updated response codes on requests for errored videos**

Stream will now return HTTP error status 424 (failed dependency) when requesting segments, manifests, thumbnails, downloads, or subtitles for videos that are in an errored state. Previously, Stream would return one of several 5xx codes for requests like this.

## 2024-04-11

**Live Instant Clipping for live broadcasts and recordings**

Clipping is now available in open beta for live broadcasts and recordings. For more information, refer to [Live instant clipping](https://developers.cloudflare.com/stream/stream-live/live-instant-clipping/) documentation.

## 2024-02-16

**Tonemapping improvements for HDR content**

In certain cases, videos uploaded with an HDR colorspace (such as footage from certain mobile devices) appeared washed out or desaturated when played back. This issue is resolved for new uploads.

## 2023-11-07

**HLS improvements for on-demand TS output**

HLS output from Cloudflare Stream on-demand videos that use Transport Stream file format now includes a 10 second offset to timestamps. This will have no impact on most customers. A small percentage of customers will see improved playback stability. Caption files were also adjusted accordingly.

## 2023-10-10

**SRT Audio Improvements**

In some cases, playback via SRT protocol was missing an audio track regardless of existence of audio in the broadcast. This issue is now resolved.

## 2023-09-25

**LL-HLS Beta**

Low-Latency HTTP Live Streaming (LL-HLS) is now in open beta. Enable LL-HLS on your [live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/) for automatic low-latency playback using the Stream built-in player where supported.

For more information, refer to [live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/) and [custom player](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/) docs.

## 2023-08-08

**Scheduled Deletion**

Stream now supports adding a scheduled deletion date to new and existing videos. Live inputs support deletion policies for automatic recording deletion.

For more, refer to the [video on demand](https://developers.cloudflare.com/stream/uploading-videos/) or [live input](https://developers.cloudflare.com/stream/stream-live/) docs.

## 2023-05-16

**Multiple audio tracks now generally available**

Stream supports adding multiple audio tracks to an existing video.

For more, refer to the [documentation](https://developers.cloudflare.com/stream/edit-videos/adding-additional-audio-tracks/) to get started.

## 2023-04-26

**Player Enhancement Properties**

Cloudflare Stream now supports player enhancement properties.

With player enhancements, you can modify your video player to incorporate elements of your branding, such as your logo, and customize additional options to present to your viewers.

For more, refer to the [documentation](https://developers.cloudflare.com/stream/edit-videos/player-enhancements/) to get started.

## 2023-03-21

**Limits for downloadable MP4s for live recordings**

Previously, generating a download for a live recording exceeding four hours resulted in failure.

To fix the issue, now video downloads are only available for live recordings under four hours. Live recordings exceeding four hours can still be played but cannot be downloaded.

## 2023-01-04

**Earlier detection (and rejection) of non-video uploads**

Cloudflare Stream now detects non-video content on upload using [the POST API](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/) and returns a 400 Bad Request HTTP error with code `10059`.

Previously, if you or one of your users attempted to upload a file that is not a video (ex: an image), the request to upload would appear successful, but then fail to be encoded later on.

With this change, Stream responds to the upload request with an error, allowing you to give users immediate feedback if they attempt to upload non-video content.

## 2022-12-08

**Faster mp4 downloads of live recordings**

Generating MP4 downloads of live stream recordings is now significantly faster. For more, refer to [the docs](https://developers.cloudflare.com/stream/stream-live/download-stream-live-videos/).

## 2022-11-29

**Multiple audio tracks (closed beta)**

Stream now supports adding multiple audio tracks to an existing video upload. This allows you to:

* Provide viewers with audio tracks in multiple languages
* Provide dubbed audio tracks, or audio commentary tracks (ex: Director’s Commentary)
* Allow your users to customize the customize the audio mix, by providing separate audio tracks for music, speech or other audio tracks.
* Provide Audio Description tracks to ensure your content is accessible. ([WCAG 2.0 Guideline 1.2 1](https://www.w3.org/TR/WCAG20/#media-equiv-audio-desc-only))

To request an invite to the beta, refer to [this post](https://community.cloudflare.com/t/new-in-beta-support-for-multiple-audio-tracks/439629).

## 2022-11-22

**VP9 support for WebRTC live streams (beta)**

Cloudflare Stream now supports [VP9](https://developers.google.com/media/vp9) when streaming using [WebRTC (WHIP)](https://developers.cloudflare.com/stream/webrtc-beta/), currently in beta.

## 2022-11-08

**Reduced time to start WebRTC streaming and playback with Trickle ICE**

Cloudflare Stream's [WHIP](https://datatracker.ietf.org/doc/draft-ietf-wish-whip/) and [WHEP](https://www.ietf.org/archive/id/draft-murillo-whep-01.html) implementations now support [Trickle ICE](https://datatracker.ietf.org/doc/rfc8838/), reducing the time it takes to initialize WebRTC connections, and increasing compatibility with WHIP and WHEP clients.

For more, refer to [the docs](https://developers.cloudflare.com/stream/webrtc-beta/).

## 2022-11-07

**Deprecating the 'per-video' Analytics API**

The “per-video” analytics API is being deprecated. If you still use this API, you will need to switch to using the [GraphQL Analytics API](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/) by February 1, 2023. After this date, the per-video analytics API will be no longer available.

The GraphQL Analytics API provides the same functionality and more, with additional filters and metrics, as well as the ability to fetch data about multiple videos in a single request. Queries are faster, more reliable, and built on a shared analytics system that you can [use across many Cloudflare products](https://developers.cloudflare.com/analytics/graphql-api/features/data-sets/).

For more about this change and how to migrate existing API queries, refer to [this post](https://community.cloudflare.com/t/migrate-to-the-stream-graphql-analytics-api-by-feb-1st-2023/433252) and the [GraphQL Analytics API docs](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/).

## 2022-11-01

**Create an unlimited number of live inputs**

Cloudflare Stream now has no limit on the number of [live inputs](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/get/) you can create. Stream is designed to allow your end-users to go live — live inputs can be created quickly on-demand via a single API request for each of user of your platform or app.

For more on creating and managing live inputs, get started with the [docs](https://developers.cloudflare.com/stream/stream-live/).

## 2022-10-20

**More accurate bandwidth estimates for live video playback**

When playing live video, Cloudflare Stream now provides significantly more accurate estimates of the bandwidth needs of each quality level to client video players. This ensures that live video plays at the highest quality that viewers have adequate bandwidth to play.

As live video is streamed to Cloudflare, we transcode it to make it available to viewers at multiple quality levels. During transcoding, we learn about the real bandwidth needs of each segment of video at each quality level, and use this to provide an estimate of the bandwidth requirements of each quality level the in HLS (`.m3u8`) and DASH (`.mpd`) manifests.

If a live stream contains content with low visual complexity, like a slideshow presentation, the bandwidth estimates provided in the HLS manifest will be lower, ensuring that the most viewers possible view the highest quality level, since it requires relatively little bandwidth. Conversely, if a live stream contains content with high visual complexity, like live sports with motion and camera panning, the bandwidth estimates provided in the HLS manifest will be higher, ensuring that viewers with inadequate bandwidth switch down to a lower quality level, and their playback does not buffer.

This change is particularly helpful if you're building a platform or application that allows your end users to create their own live streams, where these end users have their own streaming software and hardware that you can't control. Because this new functionality adapts based on the live video we receive, rather than just the configuration advertised by the broadcaster, even in cases where your end users' settings are less than ideal, client video players will not receive excessively high estimates of bandwidth requirements, causing playback quality to decrease unnecessarily. Your end users don't have to be OBS Studio experts in order to get high quality video playback.

No work is required on your end — this change applies to all live inputs, for all customers of Cloudflare Stream. For more, refer to the [docs](https://developers.cloudflare.com/stream/stream-live/#bitrate-estimates-at-each-quality-level-bitrate-ladder).

## 2022-10-05

**AV1 Codec support for live streams and recordings (beta)**

Cloudflare Stream now supports playback of live videos and live recordings using the [AV1 codec](https://aomedia.org/av1/), which uses 46% less bandwidth than H.264.

For more, read the [blog post](https://blog.cloudflare.com/av1-cloudflare-stream-beta).

## 2022-09-27

**WebRTC live streaming and playback (beta)**

Cloudflare Stream now supports live video streaming over WebRTC, with sub-second latency, to unlimited concurrent viewers.

For more, read the [blog post](https://blog.cloudflare.com/webrtc-whip-whep-cloudflare-stream) or the get started with example code in the [docs](https://developers.cloudflare.com/stream/webrtc-beta).

## 2022-09-15

**Manually control when you start and stop simulcasting**

You can now enable and disable individual live outputs via the API or Stream dashboard, allowing you to control precisely when you start and stop simulcasting to specific destinations like YouTube and Twitch. For more, [read the docs](https://developers.cloudflare.com/stream/stream-live/simulcasting/#control-when-you-start-and-stop-simulcasting).

## 2022-08-15

**Unique subdomain for your Stream Account**

URLs in the Stream Dashboard and Stream API now use a subdomain specific to your Cloudflare Account: `customer-{CODE}.cloudflarestream.com`. This change allows you to:

1. Use [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) directives specific to your Stream subdomain, to ensure that only videos from your Cloudflare account can be played on your website.

2. Allowlist only your Stream account subdomain at the network-level to ensure that only videos from a specific Cloudflare account can be accessed on your network.

No action is required from you, unless you use Content Security Policy (CSP) on your website. For more on CSP, read the [docs](https://developers.cloudflare.com/stream/faq/#i-use-content-security-policy-csp-on-my-website-what-domains-do-i-need-to-add-to-which-directives).

## 2022-08-02

**Clip videos using the Stream API**

You can now change the start and end times of a video uploaded to Cloudflare Stream. For more information, refer to [Clip videos](https://developers.cloudflare.com/stream/edit-videos/video-clipping/).

## 2022-07-26

**Live inputs**

The Live Inputs API now supports optional pagination, search, and filter parameters. For more information, refer to the [Live Inputs API documentation](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/list/).

## 2022-05-24

**Picture-in-Picture support**

The [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/) now displays a button to activate Picture-in-Picture mode, if the viewer's web browser supports the [Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API).

## 2022-05-13

**Creator ID property**

During or after uploading a video to Stream, you can now specify a value for a new field, `creator`. This field can be used to identify the creator of the video content, linking the way you identify your users or creators to videos in your Stream account. For more, read the [blog post](https://blog.cloudflare.com/stream-creator-management/).

## 2022-03-17

**Analytics panel in Stream Dashboard**

The Stream Dashboard now has an analytics panel that shows the number of minutes of both live and recorded video delivered. This view can be filtered by **Creator ID**, **Video UID**, and **Country**. For more in-depth analytics data, refer to the [bulk analytics documentation](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/).

## 2022-03-16

**Custom letterbox color configuration option for Stream Player**

The Stream Player can now be configured to use a custom letterbox color, displayed around the video ('letterboxing' or 'pillarboxing') when the video's aspect ratio does not match the player's aspect ratio. Refer to the documentation on configuring the Stream Player [here](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/#basic-options).

## 2022-03-10

**Support for SRT live streaming protocol**

Cloudflare Stream now supports the SRT live streaming protocol. SRT is a modern, actively maintained streaming video protocol that delivers lower latency, and better resilience against unpredictable network conditions. SRT supports newer video codecs and makes it easier to use accessibility features such as captions and multiple audio tracks.

For more, read the [blog post](https://blog.cloudflare.com/stream-now-supports-srt-as-a-drop-in-replacement-for-rtmp/).

## 2022-02-17

**Faster video quality switching in Stream Player**

When viewers manually change the resolution of video they want to receive in the Stream Player, this change now happens immediately, rather than once the existing resolution playback buffer has finished playing.

## 2022-02-09

**Volume and playback controls accessible during playback of VAST Ads**

When viewing ads in the [VAST format](https://www.iab.com/guidelines/vast/#:~:text=VAST%20is%20a%20Video%20Ad,of%20the%20digital%20video%20marketplace.) in the Stream Player, viewers can now manually start and stop the video, or control the volume.

## 2022-01-25

**DASH and HLS manifest URLs accessible in Stream Dashboard**

If you choose to use a third-party player with Cloudflare Stream, you can now easily access HLS and DASH manifest URLs from within the Stream Dashboard. For more about using Stream with third-party players, read the docs [here](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/).

## 2022-01-22

**Input health status in the Stream Dashboard**

When a live input is connected, the Stream Dashboard now displays technical details about the connection, which can be used to debug configuration issues.

## 2022-01-06

**Live viewer count in the Stream Player**

The [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/) now shows the total number of people currently watching a video live.

## 2022-01-04

**Webhook notifications for live stream connections events**

You can now configure Stream to send webhooks each time a live stream connects and disconnects. For more information, refer to the [Webhooks documentation](https://developers.cloudflare.com/stream/stream-live/webhooks).

## 2021-12-07

**FedRAMP Support**

The Stream Player can now be served from a [FedRAMP](https://www.cloudflare.com/press-releases/2021/cloudflare-hits-milestone-in-fedramp-approval/) compliant subdomain.

## 2021-11-23

**24/7 Live streaming support**

You can now use Cloudflare Stream for 24/7 live streaming.

## 2021-11-17

**Persistent Live Stream IDs**

You can now start and stop live broadcasts without having to provide a new video UID to the Stream Player (or your own player) each time the stream starts and stops. [Read the docs](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/#view-by-live-input-id).

## 2021-10-14

**MP4 video file downloads for live videos**

Once a live video has ended and been recorded, you can now give viewers the option to download an MP4 video file of the live recording. For more, read the docs [here](https://developers.cloudflare.com/stream/stream-live/download-stream-live-videos/).

## 2021-09-30

**Serverless Live Streaming**

Stream now supports live video content! For more information, read the [blog post](https://blog.cloudflare.com/stream-live/) and get started by reading the [docs](https://developers.cloudflare.com/stream/stream-live/).

## 2021-07-26

**Thumbnail previews in Stream Player seek bar**

The Stream Player now displays preview images when viewers hover their mouse over the seek bar, making it easier to skip to a specific part of a video.

## 2021-07-26

**MP4 video file downloads (GA)**

All Cloudflare Stream customers can now give viewers the option to download videos uploaded to Stream as an MP4 video file. For more, read the docs [here](https://developers.cloudflare.com/stream/viewing-videos/download-videos/).

## 2021-07-10

**Stream Connect (open beta)**

You can now opt-in to the Stream Connect beta, and use Cloudflare Stream to restream live video to any platform that accepts RTMPS input, including Facebook, YouTube and Twitch.

For more, read the [blog post](https://blog.cloudflare.com/restream-with-stream-connect/) or the [docs](https://developers.cloudflare.com/stream/stream-live/simulcasting/).

## 2021-06-10

**Simplified signed URL token generation**

You can now obtain a signed URL token via a single API request, without needing to generate signed tokens in your own application. [Read the docs](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream).

## 2021-06-08

**Stream Connect (closed beta)**

You can now use Cloudflare Stream to restream or simulcast live video to any platform that accepts RTMPS input, including Facebook, YouTube and Twitch.

For more, read the [blog post](https://blog.cloudflare.com/restream-with-stream-connect/) or the [docs](https://developers.cloudflare.com/stream/stream-live/simulcasting/).

## 2021-05-03

**MP4 video file downloads (beta)**

You can now give your viewers the option to download videos uploaded to Stream as an MP4 video file. For more, read the docs [here](https://developers.cloudflare.com/stream/viewing-videos/download-videos/).

## 2021-03-29

**Picture quality improvements**

Cloudflare Stream now encodes videos with fewer artifacts, resulting in improved video quality for your viewers.

## 2021-03-25

**Improved client bandwidth hints for third-party video players**

If you use Cloudflare Stream with a third party player, and send the `clientBandwidthHint` parameter in requests to fetch video manifests, Cloudflare Stream now selects the ideal resolution to provide to your client player more intelligently. This ensures your viewers receive the ideal resolution for their network connection.

## 2021-03-25

**Improved client bandwidth hints for third-party video players**

If you use Cloudflare Stream with a third party player, and send the `clientBandwidthHint` parameter in requests to fetch video manifests, Cloudflare Stream now selects the ideal resolution to provide to your client player more intelligently. This ensures your viewers receive the ideal resolution for their network connection.

## 2021-03-17

**Less bandwidth, identical video quality**

Cloudflare Stream now delivers video using 3-10x less bandwidth, with no reduction in quality. This ensures faster playback for your viewers with less buffering, particularly when viewers have slower network connections.

## 2021-03-10

**Stream Player 2.0 (preview)**

A brand new version of the Stream Player is now available for preview. New features include:

* Unified controls across desktop and mobile devices
* Keyboard shortcuts
* Intelligent mouse cursor interactions with player controls
* Phased out support for Internet Explorer 11

For more, refer to [this post](https://community.cloudflare.com/t/announcing-the-preview-build-for-stream-player-2-0/243095) on the Cloudflare Community Forum.

## 2021-03-04

**Faster video encoding**

Videos uploaded to Cloudflare Stream are now available to view 5x sooner, reducing the time your users wait between uploading and viewing videos.

## 2021-01-17

**Removed weekly upload limit, increased max video upload size**

You can now upload videos up to 30GB in size to Cloudflare Stream and also now upload an unlimited number of videos to Cloudflare Stream each week

## 2020-12-14

**Tus support for direct creator uploads**

You can now use the [tus protocol](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/#advanced-upload-flow-using-tus-for-large-videos) when allowing creators (your end users) to upload their own videos directly to Cloudflare Stream.

In addition, all uploads to Cloudflare Stream made using tus are now faster and more reliable as part of this change.

## 2020-12-09

**Multiple audio track mixdown**

Videos with multiple audio tracks (ex: 5.1 surround sound) are now mixed down to stereo when uploaded to Stream. The resulting video, with stereo audio, is now playable in the Stream Player.

## 2020-12-02

**Storage limit notifications**

Cloudflare now emails you if your account is using 75% or more of your prepaid video storage, so that you can take action and plan ahead.

</page>

<page>
---
title: Edit videos · Cloudflare Stream docs
lastUpdated: 2024-08-30T13:02:26.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/
  md: https://developers.cloudflare.com/stream/edit-videos/index.md
---

* [Add additional audio tracks](https://developers.cloudflare.com/stream/edit-videos/adding-additional-audio-tracks/)
* [Add captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/)
* [Apply watermarks](https://developers.cloudflare.com/stream/edit-videos/applying-watermarks/)
* [Add player enhancements](https://developers.cloudflare.com/stream/edit-videos/player-enhancements/)
* [Clip videos](https://developers.cloudflare.com/stream/edit-videos/video-clipping/)

</page>

<page>
---
title: Examples · Cloudflare Stream docs
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/examples/
  md: https://developers.cloudflare.com/stream/examples/index.md
---

[Shaka Player](https://developers.cloudflare.com/stream/examples/shaka-player/)

[Example of video playback with Cloudflare Stream and Shaka Player](https://developers.cloudflare.com/stream/examples/shaka-player/)

[RTMPS playback](https://developers.cloudflare.com/stream/examples/rtmps_playback/)

[Example of sub 1s latency video playback using RTMPS and ffplay](https://developers.cloudflare.com/stream/examples/rtmps_playback/)

[SRT playback](https://developers.cloudflare.com/stream/examples/srt_playback/)

[Example of sub 1s latency video playback using SRT and ffplay](https://developers.cloudflare.com/stream/examples/srt_playback/)

[Android (ExoPlayer)](https://developers.cloudflare.com/stream/examples/android/)

[Example of video playback on Android using ExoPlayer](https://developers.cloudflare.com/stream/examples/android/)

[dash.js](https://developers.cloudflare.com/stream/examples/dash-js/)

[Example of video playback with Cloudflare Stream and the DASH reference player (dash.js)](https://developers.cloudflare.com/stream/examples/dash-js/)

[hls.js](https://developers.cloudflare.com/stream/examples/hls-js/)

[Example of video playback with Cloudflare Stream and the HLS reference player (hls.js)](https://developers.cloudflare.com/stream/examples/hls-js/)

[iOS (AVPlayer)](https://developers.cloudflare.com/stream/examples/ios/)

[Example of video playback on iOS using AVPlayer](https://developers.cloudflare.com/stream/examples/ios/)

[Video.js](https://developers.cloudflare.com/stream/examples/video-js/)

[Example of video playback with Cloudflare Stream and Video.js](https://developers.cloudflare.com/stream/examples/video-js/)

[Stream Player](https://developers.cloudflare.com/stream/examples/stream-player/)

[Example of video playback with the Cloudflare Stream Player](https://developers.cloudflare.com/stream/examples/stream-player/)

[Vidstack](https://developers.cloudflare.com/stream/examples/vidstack/)

[Example of video playback with Cloudflare Stream and Vidstack](https://developers.cloudflare.com/stream/examples/vidstack/)

[First Live Stream with OBS](https://developers.cloudflare.com/stream/examples/obs-from-scratch/)

[Set up and start your first Live Stream using OBS (Open Broadcaster Software) Studio](https://developers.cloudflare.com/stream/examples/obs-from-scratch/)

</page>

<page>
---
title: Frequently asked questions about Cloudflare Stream · Cloudflare Stream docs
description: Cloudflare decides on which bitrate, resolution, and codec is best
  for you. We deliver all videos to industry standard H264 codec. We use a few
  different adaptive streaming levels from 360p to 1080p to ensure smooth
  streaming for your audience watching on different devices and bandwidth
  constraints.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/faq/
  md: https://developers.cloudflare.com/stream/faq/index.md
---

## Stream

### What formats and quality levels are delivered through Cloudflare Stream?

Cloudflare decides on which bitrate, resolution, and codec is best for you. We deliver all videos to industry standard H264 codec. We use a few different adaptive streaming levels from 360p to 1080p to ensure smooth streaming for your audience watching on different devices and bandwidth constraints.

### Can I download original video files from Stream?

You cannot download the *exact* input file that you uploaded. However, depending on your use case, you can use the [Downloadable Videos](https://developers.cloudflare.com/stream/viewing-videos/download-videos/) feature to get encoded MP4s for use cases like offline viewing.

### Is there a limit to the amount of videos I can upload?

* By default, a video upload can be at most 30 GB.

* By default, you can have up to 120 videos queued or being encoded simultaneously. Videos in the `ready` status are playable but may still be encoding certain quality levels until the `pctComplete` reaches 100. Videos in the `error`, `ready`, or `pendingupload` state do not count toward this limit. If you need the concurrency limit raised, [contact Cloudflare support](https://developers.cloudflare.com/support/contacting-cloudflare-support/) explaining your use case and why you would like the limit raised.

Note

The limit to the number of videos only applies to videos being uploaded to Cloudflare Stream. This limit is not related to the number of end users streaming videos.

* An account cannot upload videos if the total video duration exceeds the video storage capacity purchased.

Limits apply to Direct Creator Uploads at the time of upload URL creation.

Uploads over these limits will receive a [429 (Too Many Requests)](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/4xx-client-error/error-429/) or [413 (Payload too large)](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/4xx-client-error/error-413/) HTTP status codes with more information in the response body. Please write to Cloudflare support or your customer success manager for higher limits.

### Can I embed videos on Stream even if my domain is not on Cloudflare?

Yes. Stream videos can be embedded on any domain, even domains not on Cloudflare.

### What input file formats are supported?

Users can upload video in the following file formats:

MP4, MKV, MOV, AVI, FLV, MPEG-2 TS, MPEG-2 PS, MXF, LXF, GXF, 3GP, WebM, MPG, QuickTime

### Does Stream support High Dynamic Range (HDR) video content?

When HDR videos are uploaded to Stream, they are re-encoded and delivered in SDR format, to ensure compatibility with the widest range of viewing devices.

### What frame rates (FPS) are supported?

Cloudflare Stream supports video file uploads for any FPS, however videos will be re-encoded for 70 FPS playback. If the original video file has a frame rate lower than 70 FPS, Stream will re-encode at the original frame rate.

If the frame rate is variable we will drop frames (for example if there are more than 1 frames within 1/30 seconds, we will drop the extra frames within that period).

### What browsers does Stream work on?

You can embed the Stream player on the following platforms:

Note

Cloudflare Stream is not available on Chromium, as Chromium does not support H.264 videos.

### What are the recommended upload settings for video uploads?

If you are producing a brand new file for Cloudflare Stream, we recommend you use the following settings:

* MP4 containers, AAC audio codec, H264 video codec, 30 or below frames per second
* moov atom should be at the front of the file (Fast Start)
* H264 progressive scan (no interlacing)
* H264 high profile
* Closed GOP
* Content should be encoded and uploaded in the same frame rate it was recorded
* Mono or Stereo audio (Stream will mix audio tracks with more than 2 channels down to stereo)

Below are bitrate recommendations for encoding new videos for Stream:

### If I cancel my stream subscription, are the videos deleted?

Videos are removed if the subscription is not renewed within 30 days.

### I use Content Security Policy (CSP) on my website. What domains do I need to add to which directives?

If your website uses [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) directives, depending on your configuration, you may need to add Cloudflare Stream's domains to particular directives, in order to allow videos to be viewed or uploaded by your users.

If you use the provided [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/), `videodelivery.net` and `*.cloudflarestream.com` must be included in the `frame-src` or `default-src` directive to allow the player's `<iframe>` element to load.

```http
Content-Security-Policy: frame-src 'self' videodelivery.net *.cloudflarestream.com
```

If you use your **own** Player, add `*.videodelivery.net` and `*.cloudflarestream.com` to the `media-src`, `img-src` and `connect-src` CSP directives to allow video files and thumbnail images to load.

```http
Content-Security-Policy: media-src 'self' videodelivery.net *.cloudflarestream.com; img-src 'self' *.videodelivery.net *.cloudflarestream.com; connect-src 'self' *.videodelivery.net *.cloudflarestream.com
```

If you allow users to upload their own videos directly to Cloudflare Stream, add `*.videodelivery.net` and `*.cloudflarestream.com` to the `connect-src` CSP directive.

```http
Content-Security-Policy: connect-src 'self' *.videodelivery.net *.cloudflarestream.com
```

To ensure **only** videos from **your** Cloudflare Stream account can be played on your website, replace `*` in `*.cloudflarestream.com` and `*.videodelivery.net` in the examples above with `customer-<CODE>`, replacing `<CODE>` with your unique customer code. To find your unique customer code in the Cloudflare dashboard, go to the **Stream** page.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

This code is unique to your Cloudflare Account.

### Why is PageSpeed Insights giving a bad score when using the Stream Player?

If your website loads in a lot of player instances, PageSpeed Insights will penalize the JavaScript load for each player instance. Our testing shows that when actually loading the page, the script itself is only downloaded once with the local browser cache retrieving the script for the other player objects on the same page. Therefore, we believe that the PageSpeed Insights score is not matching real-world behavior in this situation.

If you are using thumbnails, you can use [animated thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/#animated-gif-thumbnails) that link to the video pages.

If multiple players are on the same page, you can lazy load any players that are not visible in the initial viewport. For more information about lazy loading, refer to [Mozilla's lazy loading documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#lazy).

</page>

<page>
---
title: Get started · Cloudflare Stream docs
description: You can upload videos using the API or directly on the Stream page
  of the Cloudflare dashboard.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/get-started/
  md: https://developers.cloudflare.com/stream/get-started/index.md
---

Media Transformations is now GA:

Billing for Media Transformations will begin on November 1st, 2025.

* [Upload your first video](https://developers.cloudflare.com/stream/get-started#upload-your-first-video)
* [Start your first live stream](https://developers.cloudflare.com/stream/get-started#start-your-first-live-stream)

## Upload your first video

### Step 1: Upload an example video from a public URL

You can upload videos using the API or directly on the **Stream** page of the Cloudflare dashboard.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

To use the API, replace the `API_TOKEN` and `ACCOUNT_ID` values with your credentials in the example below.

```bash
curl \
-X POST \
-d '{"url":"https://storage.googleapis.com/stream-example-bucket/video.mp4","meta":{"name":"My First Stream Video"}}' \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/copy
```

### Step 2: Wait until the video is ready to stream

Because Stream must download and process the video, the video might not be available for a few seconds depending on the length of your video. You should poll the Stream API until `readyToStream` is `true`, or use [webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/) to be notified when a video is ready for streaming.

Use the video UID from the first step to poll the video:

```bash
curl \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>
```

```json
{
  "result": {
    "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
    "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
    "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
    "readyToStream": true,
    "status": {
      "state": "ready"
    },
    "meta": {
      "downloaded-from": "https://storage.googleapis.com/stream-example-bucket/video.mp4",
      "name": "My First Stream Video"
    },
    "created": "2020-10-16T20:20:17.872170843Z",
    "size": 9032701
    //...
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

### Step 3: Play the video in your website or app

Videos uploaded to Stream can be played on any device and platform, from websites to native apps. See [Play videos](https://developers.cloudflare.com/stream/viewing-videos) for details and examples of video playback across platforms.

To play video on your website with the [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/), copy the `uid` of the video from the request above, along with your unique customer code, and replace `<CODE>` and `<VIDEO_UID>` in the embed code below:

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
  title="Example Stream video"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
>
</iframe>
```

The embed code above can also be found on the **Stream** page of the Cloudflare dashboard.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

### Next steps

* [Edit your video](https://developers.cloudflare.com/stream/edit-videos/) and add captions or watermarks
* [Customize the Stream player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/)

## Start your first live stream

### Step 1: Create a live input

You can create a live input using the API or the **Live inputs** page of the Cloudflare dashboard.

[Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

To use the API, replace the `API_TOKEN` and `ACCOUNT_ID` values with your credentials in the example below.

```bash
curl -X POST \
-H "Authorization: Bearer <API_TOKEN>" \
-D '{"meta": {"name":"test stream"},"recording": { "mode": "automatic" }}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/live_inputs
```

```json
{
  "uid": "f256e6ea9341d51eea64c9454659e576",
  "rtmps": {
    "url": "rtmps://live.cloudflare.com:443/live/",
    "streamKey": "MTQ0MTcjM3MjI1NDE3ODIyNTI1MjYyMjE4NTI2ODI1NDcxMzUyMzcf256e6ea9351d51eea64c9454659e576"
  },
  "created": "2021-09-23T05:05:53.451415Z",
  "modified": "2021-09-23T05:05:53.451415Z",
  "meta": {
    "name": "test stream"
  },
  "status": null,
  "recording": {
    "mode": "automatic",
    "requireSignedURLs": false,
    "allowedOrigins": null
  }
}
```

### Step 2: Copy the RTMPS URL and key, and use them with your live streaming application.

We recommend using [Open Broadcaster Software (OBS)](https://obsproject.com/) to get started.

### Step 3: Play the live stream in your website or app

Live streams can be played on any device and platform, from websites to native apps, using the same video players as videos uploaded to Stream. See [Play videos](https://developers.cloudflare.com/stream/viewing-videos) for details and examples of video playback across platforms.

To play the live stream you just started on your website with the [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/), copy the `uid` of the live input from the request above, along with your unique customer code, and replace `<CODE>` and `<VIDEO_UID>` in the embed code below:

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
  title="Example Stream video"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
>
</iframe>
```

The embed code above can also be found on the **Stream** page of the Cloudflare dashboard.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

### Next steps

* [Secure your stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)
* [View live viewer counts](https://developers.cloudflare.com/stream/getting-analytics/live-viewer-count/)

## Accessibility considerations

To make your video content more accessible, include [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/) and [high-quality audio recording](https://www.w3.org/WAI/media/av/av-content/).

</page>

<page>
---
title: Analytics · Cloudflare Stream docs
description: "Stream provides server-side analytics that can be used to:"
lastUpdated: 2025-09-09T16:21:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/getting-analytics/
  md: https://developers.cloudflare.com/stream/getting-analytics/index.md
---

Stream provides server-side analytics that can be used to:

* Identify most viewed video content in your app or platform.
* Identify where content is viewed from and when it is viewed.
* Understand which creators on your platform are publishing the most viewed content, and analyze trends.

You can access data on either:

* The Stream **Analytics** page of the Cloudflare dashboard.

  [Go to **Analytics**](https://dash.cloudflare.com/?to=/:account/stream/analytics)

* The [GraphQL Analytics API](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics).

Users will need the **Analytics** permission to access analytics via Dash or GraphQL.

</page>

<page>
---
title: Manage videos · Cloudflare Stream docs
lastUpdated: 2024-08-22T17:44:03.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/stream/manage-video-library/
  md: https://developers.cloudflare.com/stream/manage-video-library/index.md
---


</page>

<page>
---
title: Pricing · Cloudflare Stream docs
description: "Cloudflare Stream lets you broadcast, store, and deliver video
  using a simple, unified API and simple pricing. Stream bills on two dimensions
  only:"
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/pricing/
  md: https://developers.cloudflare.com/stream/pricing/index.md
---

Media Transformations is now GA:

Billing for Media Transformations will begin on November 1st, 2025.

## Pricing for Stream

Cloudflare Stream lets you broadcast, store, and deliver video using a simple, unified API and simple pricing. Stream bills on two dimensions only:

* **Minutes of video stored:** the total duration of uploaded video and live recordings
* **Minutes of video delivered:** the total duration of video delivered to end users

On-demand and live video are billed the same way.

Ingress (sending your content to us) and encoding are always free. Bandwidth is already included in "video delivered" with no additional egress (traffic/bandwidth) fees.

### Minutes of video stored

Storage is a prepaid pricing dimension purchased in increments of $5 per 1,000 minutes stored, regardless of file size. You can check how much storage you have and how much you have used on the **Stream** page of the Cloudflare dashboard.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

Storage is consumed by:

* Original videos uploaded to your account
* Recordings of live broadcasts
* The reserved `maxDurationSeconds` for Direct Creator and TUS uploads which have not been completed. After these uploads are complete or the upload link expires, this reservation is released.

Storage is not consumed by:

* Videos in an unplayable or errored state
* Expired Direct Creator upload links
* Deleted videos
* Downloadable files generated for [MP4 Downloads](https://developers.cloudflare.com/stream/viewing-videos/download-videos/)
* Multiple quality levels that Stream generates for each uploaded original

Storage consumption is rounded up to the second of video duration; file size does not matter. Video stored in Stream does not incur additional storage fees from other storage products such as R2.

Note

If you run out of storage, you will not be able to upload new videos or start new live streams until you purchase more storage or delete videos.

Enterprise customers *may* continue to upload new content beyond their contracted quota without interruption.

### Minutes of video delivered

Delivery is a post-paid, usage-based pricing dimension billed at $1 per 1,000 minutes delivered. You can check how much delivery you have used on the **Billing** page or the Stream **Analytics** page of the Cloudflare dashboard.

[Go to **Billing** ](https://dash.cloudflare.com/?to=/:account/billing)[Go to **Analytics**](https://dash.cloudflare.com/?to=/:account/stream/analytics)

Delivery is counted for the following uses:

* Playback on the web or an app using [Stream's built-in player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/) or the [HLS or DASH manifests](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/)
* MP4 Downloads
* Simulcasting via SRT or RTMP live outputs

Delivery is counted by HTTP requests for video segments or parts of the MP4. Therefore:

* Client-side preloading and buffering is counted as billable delivery.
* Content played from client-side/browser cache is *not* billable, like a short looping video. Some mobile app player libraries do not cache HLS segments by default.
* MP4 Downloads are billed by percentage of the file delivered.

Minutes delivered for web playback (Stream Player, HLS, and DASH) are rounded to the *segment* length: for uploaded content, segments are four seconds. Live broadcast and recording segments are determined by the keyframe interval or GOP size of the original broadcast.

### Example scenarios

**Two people each watch thirty minutes of a video or live broadcast. How much would it cost?**

This will result in 60 minutes of Minutes Delivered usage (or $0.06). Stream bills on total minutes of video delivered across all users.

**I have a really large file. Does that cost more?**

The cost to store a video is based only on its duration, not its file size. If the file is within the [30GB max file size limitation](https://developers.cloudflare.com/stream/faq/#is-there-a-limit-to-the-amount-of-videos-i-can-upload), it will be accepted. Be sure to use an [upload method](https://developers.cloudflare.com/stream/uploading-videos/) like Upload from Link or TUS that handles large files well.

**If I make a Direct Creator Upload link with a maximum duration (`maxDurationSeconds`) of 600 seconds which expires in 1 hour, how is storage consumed?**

* Ten minutes (600 seconds) will be subtracted from your available storage immediately.
* If the link is unused in one hour, those 10 minutes will be released.
* If the creator link is used to upload a five minute video, when the video is uploaded and processed, the 10 minute reservation will be released and the true five minute duration of the file will be counted.
* If the creator link is used to upload a five minute video but it fails to encode, the video will be marked as errored, the reserved storage will be released, and no storage use will be counted.

**I am broadcasting live, but no one is watching. How much does that cost?**

A live broadcast with no viewers will cost $0 for minutes delivered, but the recording of the broadcast will count toward minutes of video stored.

If someone watches the recording, that will be counted as minutes of video delivered.

If the recording is deleted, the storage use will be released.

**I want to store and deliver millions of minutes a month. Do you have volume pricing?**

Yes, contact our [Sales Team](https://www.cloudflare.com/plans/enterprise/contact/).

## Pricing for Media Transformations

After November 1st, 2025, Media Transforamtions and Image Transformations will use the same subscriptions and usage metrics.

* Generating a still frame (single image) from a video counts as 1 transformation.
* Generating an optimized video or extracting audio counts as 1 transformation *per second of the output* content.
* Each unique transformation, as determined by input and unique combination of flags, is only billed once per calendar month.
* All Media and Image Transformations cost $0.50 per 1,000 monthly unique transformation operations, with a free monthly allocation of 5,000.

</page>

<page>
---
title: Stream API Reference · Cloudflare Stream docs
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-api/
  md: https://developers.cloudflare.com/stream/stream-api/index.md
---


</page>

<page>
---
title: Stream live video · Cloudflare Stream docs
description: Cloudflare Stream lets you or your users stream live video, and
  play live video in your website or app, without managing and configuring any
  of your own infrastructure.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/
  md: https://developers.cloudflare.com/stream/stream-live/index.md
---

Cloudflare Stream lets you or your users [stream live video](https://www.cloudflare.com/learning/video/what-is-live-streaming/), and play live video in your website or app, without managing and configuring any of your own infrastructure.

## How Stream works

Stream handles video streaming end-to-end, from ingestion through delivery.

1. For each live stream, you create a unique live input, either using the Stream Dashboard or API.
2. Each live input has a unique Stream Key, that you provide to the creator who is streaming live video.
3. Creators use this Stream Key to broadcast live video to Cloudflare Stream, over either RTMPS or SRT.
4. Cloudflare Stream encodes this live video at multiple resolutions and delivers it to viewers, using Cloudflare's Global Network. You can play video on your website using the [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/) or using [any video player that supports HLS or DASH](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/).

![Diagram the explains the live stream workflow](https://developers.cloudflare.com/_astro/live-stream-workflow.CRSBhOc-_ZG8e0g.webp)

## RTMP reconnections

As long as your streaming software reconnects, Stream Live will continue to ingest and stream your live video. Make sure the streaming software you use to push RTMP feeds automatically reconnects if the connection breaks. Some apps like OBS reconnect automatically while other apps like FFmpeg require custom configuration.

## Bitrate estimates at each quality level (bitrate ladder)

Cloudflare Stream transcodes and makes live streams available to viewers at multiple quality levels. This is commonly referred to as [Adaptive Bitrate Streaming (ABR)](https://www.cloudflare.com/learning/video/what-is-adaptive-bitrate-streaming).

With ABR, client video players need to be provided with estimates of how much bandwidth will be needed to play each quality level (ex: 1080p). Stream creates and updates these estimates dynamically by analyzing the bitrate of your users' live streams. This ensures that live video plays at the highest quality a viewer has adequate bandwidth to play, even in cases where the broadcaster's software or hardware provides incomplete or inaccurate information about the bitrate of their live content.

### How it works

If a live stream contains content with low visual complexity, like a slideshow presentation, the bandwidth estimates provided in the HLS and DASH manifests will be lower —  a stream like this has a low bitrate and requires relatively little bandwidth, even at high resolution. This ensures that as many viewers as possible view the highest quality level.

Conversely, if a live stream contains content with high visual complexity, like live sports with motion and camera panning, the bandwidth estimates provided in the manifest will be higher — a stream like this has a high bitrate and requires more bandwidth. This ensures that viewers with inadequate bandwidth switch down to a lower quality level, and their playback does not buffer.

### How you benefit

If you're building a creator platform or any application where your end users create their own live streams, your end users likely use streaming software or hardware that you cannot control. In practice, these live streaming setups often send inaccurate or incomplete information about the bitrate of a given live stream, or are misconfigured by end users.

Stream adapts based on the live video that we actually receive, rather than blindly trusting the advertised bitrate. This means that even in cases where your end users' settings are less than ideal, client video players will still receive the most accurate bitrate estimates possible, ensuring the highest quality video playback for your viewers, while avoiding pushing configuration complexity back onto your users.

## Transition from live playback to a recording

Recordings are available for live streams within 60 seconds after a live stream ends.

You can check a video's status to determine if it's ready to view by making a [`GET` request to the `stream` endpoint](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/#use-the-api) and viewing the `state` or by [using the Cloudflare dashboard](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/#use-the-dashboard).

After the live stream ends, you can [replay live stream recordings](https://developers.cloudflare.com/stream/stream-live/replay-recordings/) in the `ready` state by using one of the playback URLs.

## Billing

Stream Live is billed identically to the rest of Cloudflare Stream.

* You pay $5 per 1000 minutes of recorded video.
* You pay $1 per 1000 minutes of delivered video.

All Stream Live videos are automatically recorded. There is no additional cost for encoding and packaging live videos.

</page>

<page>
---
title: Transform videos · Cloudflare Stream docs
description: You can optimize and manipulate videos stored outside of Cloudflare
  Stream with Media Transformations. Transformed videos and images are served
  from one of your zones on Cloudflare.
lastUpdated: 2026-01-29T11:44:10.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/transform-videos/
  md: https://developers.cloudflare.com/stream/transform-videos/index.md
---

Media Transformations is now GA:

Billing for Media Transformations will begin on November 1st, 2025.

You can optimize and manipulate videos stored *outside* of Cloudflare Stream with Media Transformations. Transformed videos and images are served from one of your zones on Cloudflare.

To transform a video or image, you must [enable transformations](https://developers.cloudflare.com/stream/transform-videos/#getting-started) for your zone. If your zone already has Image Transformations enabled, you can also optimize videos with Media Transformations.

## Getting started

You can dynamically optimize and generate still images from videos that are stored *outside* of Cloudflare Stream with Media Transformations.

Cloudflare will automatically cache every transformed video or image on our global network so that you store only the original image at your origin.

To enable transformations on your zone:

1. In the Cloudflare dashboard, go to the **Transformations** page.

   [Go to **Transformations**](https://dash.cloudflare.com/?to=/:account/stream/video-transformations)

2. Locate the specific zone where you want to enable transformations.

3. Select **Enable** for the zone.

## Transform a video by URL

You can convert and resize videos by requesting them via a specially-formatted URL, without writing any code. The URL format is:

```plaintext
https://example.com/cdn-cgi/media/<OPTIONS>/<SOURCE-VIDEO>
```

* `example.com`: Your website or zone on Cloudflare, with Transformations enabled.
* `/cdn-cgi/media/`: A prefix that identifies a special path handled by Cloudflare's built-in media transformation service.
* `<OPTIONS>`: A comma-separated list of options. Refer to the available options below.
* `<SOURCE-VIDEO>`: A full URL (starting with `https://` or `http://`) of the original asset to resize.

For example, this URL will source an HD video from an R2 bucket, shorten it, crop and resize it as a square, and remove the audio.

```plaintext
https://example.com/cdn-cgi/media/mode=video,time=5s,duration=5s,width=500,height=500,fit=crop,audio=false/https://pub-8613b7f94d6146408add8fefb52c52e8.r2.dev/aus-mobile-demo.mp4
```

The result is an MP4 that can be used in an HTML video element without a player library.

## Options

### `mode`

Specifies the kind of output to generate.

* `video`: Outputs an H.264/AAC optimized MP4 file.
* `frame`: Outputs a still image.
* `spritesheet`: Outputs a JPEG with multiple frames.
* `audio`: Outputs an AAC encoded M4A file.

### `time`

Specifies when to start extracting the output in the input file. Depends on `mode`:

* When `mode` is `spritesheet`, `video`, or `audio`, specifies the timestamp where the output will start.
* When `mode` is `frame`, specifies the timestamp from which to extract the still image.
* Formats as a time string, for example: 5s, 2m
* Acceptable range: 0 – 10m
* Default: 0

### `duration`

The duration of the output video or spritesheet. Depends on `mode`:

* When `mode` is `video` or `audio`, specifies the duration of the output.
* When `mode` is `spritesheet`, specifies the time range from which to select frames.
* Acceptable range: 1s - 60s (or 1m)
* Default: input duration or 60 seconds, whichever is shorter

### `fit`

In combination with `width` and `height`, specifies how to resize and crop the output. If the output is resized, it will always resize proportionally so content is not stretched.

* `contain`: Respecting aspect ratio, scales a video up or down to be entirely contained within output dimensions.
* `scale-down`: Same as contain, but downscales to fit only. Do not upscale.
* `cover`: Respecting aspect ratio, scales a video up or down to entirely cover the output dimensions, with a center-weighted crop of the remainder.

### `height`

Specifies maximum height of the output in pixels. Exact behavior depends on `fit`.

* Acceptable range: 10-2000 pixels

### `width`

Specifies the maximum width of the image in pixels. Exact behavior depends on `fit`.

* Acceptable range: 10-2000 pixels

### `audio`

When `mode` is `video`, specifies whether or not to include the source audio in the output.

* `true`: Includes source audio.
* `false`: Output will be silent.
* Default: `true`

When `mode` is `audio`, audio cannot be false.

### `format`

If `mode` is `frame`, specifies the image output format.

* Acceptable options: `jpg`, `png`

If `mode` is `audio`, specifies the audio output format.

* Acceptable options: `m4a` (default)

### `filename`

Specifies the filename to use in the returned Content-Disposition header. If not specified, the filename will be derived from the source URL.

* Acceptable values:

  * Maximum of 120 characters in length.
  * Can only contain lowercase letters (a-z), numbers (0-9), hyphens (-), underscores (\_), and an optional extension. A valid name satisfies this regular expression: `^[a-zA-Z0-9-_]+.?[a-zA-Z0-9-_]+$`.

* Examples: `default.mp4`, `shortened-clip_5s`

## Source video requirements

* Input video must be less than 100MB.
* Input video should be an MP4 with H.264 encoded video and AAC or MP3 encoded audio. Other formats may work but are untested.
* Origin must support either HTTP HEAD and range requests, and must return a Content-Range header.

## Limitations

* Maximum input file size is 100 MB. Maximum duration of input video is 10 minutes.
* Media Transformations are not compatible with [Bring Your Own IP (BYOIP)](https://developers.cloudflare.com/byoip/).
* Input video should be an MP4 with H.264 encoded video and AAC or MP3 encoded audio, or animated GIF. Other formats may work but are untested.

## Pricing

After November 1st, 2025, Media Transformations and Image Transformations will use the same subscriptions and usage metrics.

* Generating a still frame (single image) from a video counts as 1 transformation.
* Generating an optimized video or extracting audio counts as 1 transformation *per second of the output* content.
* Each unique transformation, as determined by input and unique combination of flags, is only billed once per calendar month.
* All Media and Image Transformations cost $0.50 per 1,000 monthly unique transformation operations, with a free monthly allocation of 5,000.

</page>

<page>
---
title: Upload videos · Cloudflare Stream docs
description: Before you upload your video, review the options for uploading a
  video, supported formats, and recommendations.
lastUpdated: 2025-07-28T14:52:18.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/
  md: https://developers.cloudflare.com/stream/uploading-videos/index.md
---

Before you upload your video, review the options for uploading a video, supported formats, and recommendations.

## Upload options

| Upload method | When to use |
| - | - |
| [Stream Dashboard](https://dash.cloudflare.com/?to=/:account/stream) | Upload videos from the Stream Dashboard without writing any code. |
| [Upload with a link](https://developers.cloudflare.com/stream/uploading-videos/upload-via-link/) | Upload videos using a link, such as an S3 bucket or content management system. |
| [Upload video file](https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/) | Upload videos stored on a computer. |
| [Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) | Allows end users of your website or app to upload videos directly to Cloudflare Stream. |

## Supported video formats

Note

Files must be less than 30 GB, and content should be encoded and uploaded in the same frame rate it was recorded.

* MP4
* MKV
* MOV
* AVI
* FLV
* MPEG-2 TS
* MPEG-2 PS
* MXF
* LXF
* GXF
* 3GP
* WebM
* MPG
* Quicktime

## Recommendations for on-demand videos

* Optional but ideal settings:

  * MP4 containers
  * AAC audio codec
  * H264 video codec
  * 60 or fewer frames per second

* Closed GOP (*Only required for live streaming.*)

* Mono or Stereo audio. Stream will mix audio tracks with more than two channels down to stereo.

</page>

<page>
---
title: Play video · Cloudflare Stream docs
lastUpdated: 2024-08-30T13:02:26.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/
  md: https://developers.cloudflare.com/stream/viewing-videos/index.md
---

* [Use your own player](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/)
* [Use the Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/)
* [Secure your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)
* [Display thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/)
* [Download video or audio](https://developers.cloudflare.com/stream/viewing-videos/download-videos/)

</page>

<page>
---
title: WebRTC · Cloudflare Stream docs
description: Sub-second latency live streaming (using WHIP) and playback (using
  WHEP) to unlimited concurrent viewers.
lastUpdated: 2026-02-02T10:17:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/webrtc-beta/
  md: https://developers.cloudflare.com/stream/webrtc-beta/index.md
---

Sub-second latency live streaming (using WHIP) and playback (using WHEP) to unlimited concurrent viewers.

WebRTC is ideal for when you need live video to playback in near real-time, such as:

* When the outcome of a live event is time-sensitive (live sports, financial news)
* When viewers interact with the live stream (live Q\&A, auctions, etc.)
* When you want your end users to be able to easily go live or create their own video content, from a web browser or native app

Note

WebRTC streaming is currently in beta, and we'd love to hear what you think. Join the Cloudflare Discord server [using this invite](https://discord.com/invite/cloudflaredev/) and hop into our [Discord channel](https://discord.com/channels/595317990191398933/893253103695065128) to let us know what you're building with WebRTC!

## Step 1: Create a live input

Create a live input using one of the two options:

* Use the **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* Make a POST request to the [`/live_inputs` API endpoint](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/create/)

```json
{
  "uid": "1a553f11a88915d093d45eda660d2f8c",
 ...
  "webRTC": {
    "url": "https://customer-<CODE>.cloudflarestream.com/<SECRET>/webRTC/publish"
  },
  "webRTCPlayback": {
    "url": "https://customer-<CODE>.cloudflarestream.com/<INPUT_UID>/webRTC/play"
  },
...
}
```

## Step 2: Go live using WHIP

Every live input has a unique URL that one creator can be stream to. This URL should *only* be shared with the creator — anyone with this URL has the ability to stream live video to this live input.

Copy the URL from either:

* The **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* The `webRTC` key in the API response (see above).

Paste this URL into the example code.

```javascript
// Add a <video> element to the HTML page this code runs in:
// <video id="input-video" autoplay muted></video>


import WHIPClient from "./WHIPClient.js";


const url = "<WEBRTC_URL_FROM_YOUR_LIVE_INPUT>"; // add the webRTC URL from your live input here
const videoElement = document.getElementById("input-video");
const client = new WHIPClient(url, videoElement);
```

Once the creator grants permission to their camera and microphone, live video and audio will automatically start being streamed to Cloudflare, using WebRTC.

You can also use this URL with any client that supports the [WebRTC-HTTP ingestion protocol (WHIP)](https://www.ietf.org/archive/id/draft-ietf-wish-whip-16.html). See [supported WHIP clients](#supported-whip-and-whep-clients) for a list of clients we have tested and confirmed compatibility with Cloudflare Stream.

## Step 3: Play live video using WHEP

Copy the URL from either:

* The **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* The `webRTCPlayback` key in the API response (see above)

There are no limits on the number of concurrent viewers.

Paste this URL into the example code.

```javascript
// Add a <video> element to the HTML page this code runs in:
// <video id="output-video" autoplay muted></video>


import WHEPClient from "./WHEPClient.js";


const url = "<WEBRTC_URL_FROM_YOUR_LIVE_INPUT>"; // add the webRTCPlayback URL from your live input here
const videoElement = document.getElementById("output-video");
const client = new WHEPClient(url, videoElement);
```

As long as the creator is actively streaming, viewers should see their broadcast in their browser, with less than 1 second of latency.

You can also use this URL with any client that supports the [WebRTC-HTTP egress protocol (WHEP)](https://www.ietf.org/archive/id/draft-murillo-whep-01.html). See [supported WHEP clients](#supported-whip-and-whep-clients) for a list of clients we have tested and confirmed compatibility with Cloudflare Stream.

## Using WebRTC in native apps

If you are building a native app, the example code above can run within a [WkWebView (iOS)](https://developer.apple.com/documentation/webkit/wkwebview), [WebView (Android)](https://developer.android.com/reference/android/webkit/WebView) or using [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/BasicUsage.md). If you need to use WebRTC without a webview, you can use Google's Java and Objective-C native [implementations of WebRTC APIs](https://webrtc.googlesource.com/src/+/refs/heads/main/sdk).

## Debugging WebRTC

* **Chrome**: Navigate to `chrome://webrtc-internals` to view detailed logs and graphs.
* **Firefox**: Navigate to `about:webrtc` to view information about WebRTC sessions, similar to Chrome.
* **Safari**: To enable WebRTC logs, from the inspector, open the settings tab (cogwheel icon), and set WebRTC logging to "Verbose" in the dropdown menu.

## Supported WHIP and WHEP clients

Beyond the example WHIP client and example WHEP client used in the examples above, we have tested and confirmed that the following clients are compatible with Cloudflare Stream:

### WHIP

* [OBS (Open Broadcaster Software)](https://obsproject.com)
* [@eyevinn/whip-web-client](https://www.npmjs.com/package/@eyevinn/whip-web-client) (TypeScript)
* [whip-go](https://github.com/ggarber/whip-go) (Go)
* [gst-plugins-rs](https://gitlab.freedesktop.org/gstreamer/gst-plugins-rs) (Gstreamer plugins, written in Rust)
* [Larix Broadcaster](https://softvelum.com/larix/) (free apps for iOS and Android with WebRTC based on Pion, SDK available)

### WHEP

* [@eyevinn/webrtc-player](https://www.npmjs.com/package/@eyevinn/webrtc-player) (TypeScript)
* [@eyevinn/wrtc-egress](https://www.npmjs.com/package/@eyevinn/wrtc-egress) (TypeScript)
* [gst-plugins-rs](https://gitlab.freedesktop.org/gstreamer/gst-plugins-rs) (Gstreamer plugins, written in Rust)

As more WHIP and WHEP clients are published, we are committed to supporting them and being fully compliant with the both protocols.

## Supported codecs

* [VP9](https://developers.google.com/media/vp9) (recommended for highest quality)
* [VP8](https://en.wikipedia.org/wiki/VP8)
* [h264](https://en.wikipedia.org/wiki/Advanced_Video_Coding) (Constrained Baseline Profile Level 3.1, referred to as `42e01f` in the SDP offer's `profile-level-id` parameter.)

## Conformance with WHIP and WHEP specifications

Cloudflare Stream fully supports all aspects of the [WHIP](https://www.ietf.org/archive/id/draft-ietf-wish-whip-16.html) and [WHEP](https://www.ietf.org/archive/id/draft-murillo-whep-01.html) specifications, including:

* [Trickle ICE](https://datatracker.ietf.org/doc/rfc8838/)
* [Server and client offer modes](https://www.ietf.org/archive/id/draft-murillo-whep-01.html#section-3) for WHEP

You can find the specific version of WHIP and WHEP being used in the `protocol-version` header in WHIP and WHEP API responses. The value of this header references the IETF draft slug for each protocol. Currently, Stream uses `draft-ietf-wish-whip-06` (expected to be the final WHIP draft revision) and `draft-murillo-whep-01` (the most current WHEP draft).

## Limitations while in beta

* [Recording](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/#live-stream-recording-playback) is not yet supported (coming soon)
* [Simulcasting](https://developers.cloudflare.com/stream/stream-live/simulcasting) (restreaming) is not yet supported (coming soon)
* [Live viewer counts](https://developers.cloudflare.com/stream/getting-analytics/live-viewer-count/) are not yet supported (coming soon)
* [Analytics](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/) are not yet supported (coming soon)
* WHIP and WHEP must be used together — we do not yet support streaming using RTMP/SRT and playing using WHEP, or streaming using WHIP and playing using HLS or DASH. (coming soon)
* Once generally available, WebRTC streaming will be priced just like the rest of Cloudflare Stream, based on minutes stored and minutes of video delivered.

</page>

<page>
---
title: Add additional audio tracks · Cloudflare Stream docs
description: A video must be uploaded before additional audio tracks can be
  attached to it. In the following example URLs, the video’s UID is referenced
  as VIDEO_UID.
lastUpdated: 2024-11-15T20:22:28.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/adding-additional-audio-tracks/
  md: https://developers.cloudflare.com/stream/edit-videos/adding-additional-audio-tracks/index.md
---

A video must be uploaded before additional audio tracks can be attached to it. In the following example URLs, the video’s UID is referenced as `VIDEO_UID`.

To add an audio track to a video a [Cloudflare API Token](https://www.cloudflare.com/a/account/my-account) is required.

The API will make a best effort to handle any mismatch between the duration of the uploaded audio file and the video duration, though we recommend uploading audio files that match the duration of the video. If the duration of the audio file is longer than the video, the additional audio track will be truncated to match the video duration. If the duration of the audio file is shorter than the video, silence will be appended at the end of the audio track to match the video duration.

## Upload via a link

If you have audio files stored in a cloud storage bucket, you can simply pass a HTTP link for the file. Stream will fetch the file and make it available for streaming.

`label` is required and must uniquely identify the track amongst other audio track labels for the specified video.

```bash
curl -X POST \
 -H 'Authorization: Bearer <API_TOKEN>' \
 -d '{"url": "https://www.examplestorage.com/audio_file.mp3", "label": "Example Audio Label"}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/audio/copy
```

```json
{
 "result": {
   "uid": "<AUDIO_UID>",
   "label": "Example Audio Label",
   "default": false
   "status": "queued"
 },
 "success": true,
 "errors": [],
 "messages": []
}
```

The `uid` uniquely identifies the audio track and can be used for editing or deleting the audio track. Please see instructions below on how to perform these operations.

The `default` field denotes whether the audio track will be played by default in a player. Additional audio tracks have a `false` default status, but can be edited following instructions below.

The `status` field will change to `ready` after the audio track is successfully uploaded and encoded. Should an error occur during this process, the status will denote `error`.

## Upload via HTTP

Make an HTTP request and include the audio file as an input with the name set to `file`.

Audio file uploads cannot exceed 200 MB in size. If your audio file is larger, compress the file prior to upload.

The form input `label` is required and must uniquely identify the track amongst other audio track labels for the specified video.

Note that cURL `-F` flag automatically configures the content-type header and maps `audio_file.mp3` to a form input called `file`.

```bash
curl -X POST \
 -H 'Authorization: Bearer <API_TOKEN>' \
 -F file=@/Desktop/audio_file.mp3 \
 -F label='Example Audio Label' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/audio
```

```json
{
 "result": {
   "uid": "<AUDIO_UID>",
   "label": "Example Audio Label",
   "default": false
   "status": "queued"
 },
 "success": true,
 "errors": [],
 "messages": []
}
```

## List the additional audio tracks on a video

To view additional audio tracks added to a video:

```bash
curl \
 -H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/audio
```

```json
{
  "result": {
    "audio": [
      {
        "uid": "<AUDIO_UID>",
        "label": "Example Audio Label",
        "default": false,
        "status": "ready"
      },
      {
        "uid": "<AUDIO_UID>",
        "label": "Another Audio Label",
        "default": false,
        "status": "ready"
      }
    ]
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

Note this API will not return information for audio attached to the video upload.

## Edit an additional audio track

To edit the `default` status or `label` of an additional audio track:

```bash
curl -X PATCH \
 -H 'Authorization: Bearer <API_TOKEN>' \
 -d '{"label": "Edited Audio Label", "default": true}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/audio/<AUDIO_UID>
```

Editing the `default` status of an audio track to `true` will mark all other audio tracks on the video `default` status to `false`.

```json
{
  "result": {
    "uid": "<AUDIO_UID>",
    "label": "Edited Audio Label",
    "default": true
    "status": "ready"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Delete an additional audio track

To remove an additional audio track associated with your video:

```bash
curl -X DELETE \
 -H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/audio/<AUDIO_UID>
```

Deleting a `default` audio track is not allowed. You must assign another audio track as `default` prior to deletion.

If there is an entry in `errors` response field, the audio track has not been deleted.

```json
{
  "result": "ok",
  "success": true,
  "errors": [],
  "messages": []
}
```

</page>

<page>
---
title: Add captions · Cloudflare Stream docs
description: Adding captions and subtitles to your video library.
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/adding-captions/
  md: https://developers.cloudflare.com/stream/edit-videos/adding-captions/index.md
---

Adding captions and subtitles to your video library.

## Add or modify a caption

There are two ways to add captions to a video: generating via AI or uploading a caption file.

To create or modify a caption on a video a [Cloudflare API Token](https://www.cloudflare.com/a/account/my-account) is required.

The `<LANGUAGE_TAG>` must adhere to the [BCP 47 format](http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers). For convenience, many common language codes are provided [at the bottom of this document](#most-common-language-codes). If the language you are adding is not included in the table, you can find the value through the [The IANA registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry), which maintains a list of language codes. To find the value to send, search for the language. Below is an example value from IANA when we look for the value to send for a Turkish subtitle:

```bash
%%


Subtag: tr
Description: Turkish
Added: 2005-10-16
Suppress-Script: Latn
%%
```

The `Subtag` code indicates a value of `tr`. This is the value you should send as the `language` at the end of the HTTP request.

A label is generated from the provided language. The label will be visible for user selection in the player. For example, if sent `tr`, the label `Türkçe` will be created; if sent `de`, the label `Deutsch` will be created.

### Generate a caption

Generated captions use artificial intelligence based speech-to-text technology to generate closed captions for your videos.

A video must be uploaded and in a ready state before captions can be generated. In the following example URLs, the video's UID is referenced as `<VIDEO_UID>`. To receive webhooks when a video transitions to ready after upload, follow the instructions provided in [using webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/).

Captions can be generated for the following languages:

* `cs` - Czech
* `nl` - Dutch
* `en` - English
* `fr` - French
* `de` - German
* `it` - Italian
* `ja` - Japanese
* `ko` - Korean
* `pl` - Polish
* `pt` - Portuguese
* `ru` - Russian
* `es` - Spanish

When generating captions, generate them for the spoken language in the audio.

Videos may include captions for several languages, but each language must be unique. For example, a video may have English, French, and German captions associated with it, but it cannot have two English captions. If you have already uploaded an English language caption for a video, you must first delete it in order to create an English generated caption. Instructions on how to delete a caption can be found below.

The `<LANGUAGE_TAG>` must adhere to the BCP 47 format. The tag for English is `en`. You may specify a region in the tag, such as `en-GB`, which will render a label that shows `British English` for the caption.

```bash
curl -X POST \
-H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/captions/<LANGUAGE_TAG>/generate
```

Example response:

```json
{
  "result": {
    "language": "en",
    "label": "English (auto-generated)",
    "generated": true,
    "status": "inprogress"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

The result will provide a `status` denoting the progress of the caption generation.\
There are three statuses: inprogress, ready, and error. Note that (auto-generated) is applied to the label.

Once the generated caption is ready, it will automatically appear in the video player and video manifest.

If the caption enters an error state, you may attempt to re-generate it by first deleting it and then using the endpoint listed above. Instructions on deletion are provided below.

### Upload a file

Note two changes if you edit a generated caption: the generated field will change to `false` and the (auto-generated) portion of the label will be removed.

To create or replace a caption file:

```bash
curl -X PUT \
 -H 'Authorization: Bearer <API_TOKEN>' \
 -F file=@/Users/mickie/Desktop/example_caption.vtt \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/captions/<LANGUAGE_TAG>
```

### Example Response to Add or Modify a Caption

```json
{
  "result": {
    "language": "en",
    "label": "English",
    "generated": false,
    "status": "ready"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## List the captions associated with a video

To view captions associated with a video. Note this results list will also include generated captions that are `inprogress` and `error` status:

```bash
curl -H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/captions
```

### Example response to get the captions associated with a video

```json
{
  "result": [
    {
      "language": "en",
      "label": "English (auto-generated)",
      "generated": true,
      "status": "inprogress"
    },
    {
      "language": "de",
      "label": "Deutsch",
      "generated": false,
      "status": "ready"
    }
  ],
  "success": true,
  "errors": [],
  "messages": []
}
```

## Fetch a caption file

To view the WebVTT caption file, you may make a GET request:

```bash
curl \
-H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/captions/<LANGUAGE_TAG>/vtt
```

### Example response to get the caption file for a video

```text
WEBVTT


1
00:00:00.000 --> 00:00:01.560
This is an example of


2
00:00:01.560 --> 00:00:03.880
a WebVTT caption response.
```

## Delete the captions

To remove a caption associated with your video:

```bash
curl -X DELETE \
 -H 'Authorization: Bearer <API_TOKEN>' \
 https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/captions/<LANGUAGE_TAG>
```

If there is an entry in `errors` response field, the caption has not been deleted.

### Example response to delete the caption

```json
{
  "result": "",
  "success": true,
  "errors": [],
  "messages": []
}
```

## Limitations

* A video must be uploaded before a caption can be attached to it. In the following example URLs, the video's ID is referenced as `media_id`.
* Stream only supports [WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) formatted caption files. If you have a differently formatted caption file, use [a tool to convert your file to WebVTT](https://subtitletools.com/convert-to-vtt-online) prior to uploading it.
* Videos may include several language captions, but each language must be unique. For example, a video may have English, French, and German captions associated with it, but it cannot have two French captions.
* Each caption file is limited to 10 MB in size. [Contact support](https://developers.cloudflare.com/support/contacting-cloudflare-support/) if you need to upload a larger file.

## Most common language codes

| Language Code | Language |
| - | - |
| zh | Mandarin Chinese |
| hi | Hindi |
| es | Spanish |
| en | English |
| ar | Arabic |
| pt | Portuguese |
| bn | Bengali |
| ru | Russian |
| ja | Japanese |
| de | German |
| pa | Panjabi |
| jv | Javanese |
| ko | Korean |
| vi | Vietnamese |
| fr | French |
| ur | Urdu |
| it | Italian |
| tr | Turkish |
| fa | Persian |
| pl | Polish |
| uk | Ukrainian |
| my | Burmese |
| th | Thai |

</page>

<page>
---
title: Apply watermarks · Cloudflare Stream docs
description: You can add watermarks to videos uploaded using the Stream API.
lastUpdated: 2025-04-04T15:30:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/applying-watermarks/
  md: https://developers.cloudflare.com/stream/edit-videos/applying-watermarks/index.md
---

You can add watermarks to videos uploaded using the Stream API.

To add watermarks to your videos, first create a watermark profile. A watermark profile describes the image you would like to be used as a watermark and the position of that image. Once you have a watermark profile, you can use it as an option when uploading videos.

## Quick start

Watermark profile has many customizable options. However, the default parameters generally work for most cases. Please see "Profiles" below for more details.

### Step 1: Create a profile

```bash
curl -X POST -H 'Authorization: Bearer <API_TOKEN>' \
-F file=@/Users/rchen/cloudflare.png \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks
```

### Step 2: Specify the profile UID at upload

```bash
tus-upload --chunk-size 5242880 \
--header Authentication 'Bearer <API_TOKEN>' \
--metadata watermark <WATERMARK_UID> \
/Users/rchen/cat.mp4 https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream
```

### Step 3: Done

![Screenshot of a video with Cloudflare watermark at top right](https://developers.cloudflare.com/_astro/cat.fEUyr_sc_Z23svs0.webp)

## Profiles

To create, list, delete, or get information about the profile, you will need your [Cloudflare API token](https://www.cloudflare.com/a/account/my-account).

### Optional parameters

* `name` string default: *empty string*

  * A short description for the profile. For example, "marketing videos."

* `opacity` float default: 1.0

  * Translucency of the watermark. 0.0 means completely transparent, and 1.0 means completely opaque. Note that if the watermark is already semi-transparent, setting this to 1.0 will not make it completely opaque.

* `padding` float default: 0.05

  * Blank space between the adjacent edges (determined by position) of the video and the watermark. 0.0 means no padding, and 1.0 means padded full video width or length.

  * Stream will make sure that the watermark will be at about the same position across videos with different dimensions.

* `scale` float default: 0.15

  * The size of the watermark relative to the overall size of the video. This parameter will adapt to horizontal and vertical videos automatically. 0.0 means no scaling (use the size of the watermark as-is), and 1.0 fills the entire video.

  * The algorithm will make sure that the watermark will look about the same size across videos with different dimensions.

* `position` string (enum) default: "upperRight"

  * Location of the watermark. Valid positions are: `upperRight`, `upperLeft`, `lowerLeft`, `lowerRight`, and `center`.

    Note

    Note that `center` will ignore the `padding` parameter.

## Creating a Watermark profile

### Use Case 1: Upload a local image file directly

To upload the image directly, please send a POST request using `multipart/form-data` as the content-type and specify the file under the `file` key. All other fields are optional.

```bash
curl -X POST -H "Authorization: Bearer <API_TOKEN>" \
-F file=@{path-to-image-locally} \
-F name='marketing videos' \
-F opacity=1.0 \
-F padding=0.05 \
-F scale=0.15 \
-F position=upperRight \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks
```

### Use Case 2: Pass a URL to an image

To specify a URL for upload, please send a POST request using `application/json` as the content-type and specify the file location using the `url` key. All other fields are optional.

```bash
curl -X POST -H "Authorization: Bearer <API_TOKEN>" \
-H 'Content-Type: application/json' \
-d '{
  "url": "{url-to-image}",
  "name": "marketing videos",
  "opacity": 1.0,
  "padding": 0.05,
  "scale": 0.15,
  "position": "upperRight"
}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks
```

#### Example response to creating a watermark profile

```json
{
  "result": {
    "uid": "d6373709b7681caa6c48ef2d8c73690d",
    "size": 11248,
    "height": 240,
    "width": 720,
    "created": "2020-07-29T00:16:55.719265Z",
    "downloadedFrom": null,
    "name": "marketing videos",
    "opacity": 1.0,
    "padding": 0.05,
    "scale": 0.15,
    "position": "upperRight"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

`downloadedFrom` will be populated if the profile was created via downloading from URL.

## Using a watermark profile on a video

Once you created a watermark profile, you can now use the profile at upload time for watermarking videos.

### Basic uploads

Unfortunately, Stream does not currently support specifying watermark profile at upload time for Basic Uploads.

### Upload video with a link

```bash
curl -X POST -H "Authorization: Bearer <API_TOKEN>" \
-H 'Content-Type: application/json' \
-d '{
  "url": "{url-to-video}",
  "watermark": {
    "uid": "<WATERMARK_UID>"
  }
}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/copy
```

#### Example response to upload video with a link

```json
{
  "result": {
    "uid": "8d3a5b80e7437047a0fb2761e0f7a645",
    "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",


    "playback": {
      "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
      "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
    },
    "watermark": {
      "uid": "d6373709b7681caa6c48ef2d8c73690d",
      "size": 11248,
      "height": 240,
      "width": 720,
      "created": "2020-07-29T00:16:55.719265Z",
      "downloadedFrom": null,
      "name": "marketing videos",
      "opacity": 1.0,
      "padding": 0.05,
      "scale": 0.15,
      "position": "upperRight"
    }


}
```

### Upload video with tus

```bash
tus-upload --chunk-size 5242880 \
--header Authentication 'Bearer <API_TOKEN>' \
--metadata watermark <WATERMARK_UID> \
<PATH_TO_VIDEO> https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream
```

### Direct creator uploads

The video uploaded with the generated unique one-time URL will be watermarked with the profile specified.

```bash
curl -X POST -H "Authorization: Bearer <API_TOKEN>" \
-H 'Content-Type: application/json' \
-d '{
  "maxDurationSeconds": 3600,
  "watermark": {
    "uid": "<WATERMARK_UID>"
  }
}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/direct_upload
```

#### Example response to direct user uploads

```json
{
  "result": {
    "uploadURL": "https://upload.videodelivery.net/c32d98dd671e4046a33183cd5b93682b",
    "uid": "c32d98dd671e4046a33183cd5b93682b",
    "watermark": {
      "uid": "d6373709b7681caa6c48ef2d8c73690d",
      "size": 11248,
      "height": 240,
      "width": 720,
      "created": "2020-07-29T00:16:55.719265Z",
      "downloadedFrom": null,
      "name": "marketing videos",
      "opacity": 1.0,
      "padding": 0.05,
      "scale": 0.15,
      "position": "upperRight"
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

`watermark` will be `null` if no watermark was specified.

## Get a watermark profile

To view a watermark profile that you created:

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks/<WATERMARK_UID>
```

### Example response to get a watermark profile

```json
{
  "result": {
    "uid": "d6373709b7681caa6c48ef2d8c73690d",
    "size": 11248,
    "height": 240,
    "width": 720,
    "created": "2020-07-29T00:16:55.719265Z",
    "downloadedFrom": null,
    "name": "marketing videos",
    "opacity": 1.0,
    "padding": 0.05,
    "scale": 0.15,
    "position": "center"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## List watermark profiles

To list watermark profiles that you created:

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks/
```

### Example response to list watermark profiles

```json
{
  "result": [
    {
      "uid": "9de16afa676d64faaa7c6c4d5047e637",
      "size": 207710,
      "height": 626,
      "width": 1108,
      "created": "2020-07-29T00:23:35.918472Z",
      "downloadedFrom": null,
      "name": "marketing videos",
      "opacity": 1.0,
      "padding": 0.05,
      "scale": 0.15,
      "position": "upperLeft"
    },
    {
      "uid": "9c50cff5ab16c4aec0bcb03c44e28119",
      "size": 207710,
      "height": 626,
      "width": 1108,
      "created": "2020-07-29T00:16:46.735377Z",
      "downloadedFrom": "https://company.com/logo.png",
      "name": "internal training videos",
      "opacity": 1.0,
      "padding": 0.05,
      "scale": 0.15,
      "position": "center"
    }
  ],
  "success": true,
  "errors": [],
  "messages": []
}
```

## Delete a watermark profile

To delete a watermark profile that you created:

```bash
curl -X DELETE -H 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/watermarks/<WATERMARK_UID>
```

If the operation was successful, it will return a success response:

```json
{
  "result": "",
  "success": true,
  "errors": [],
  "messages": []
}
```

## Limitations

* Once the watermark profile is created, you cannot change its parameters. If you need to edit your watermark profile, please delete it and create a new one.
* Once the watermark is applied to a video, you cannot change the watermark without re-uploading the video to apply a different profile.
* Once the watermark is applied to a video, deleting the watermark profile will not also remove the watermark from the video.
* The maximum file size is 2MiB (2097152 bytes), and only PNG files are supported.

</page>

<page>
---
title: Clip videos · Cloudflare Stream docs
description: With video clipping, also referred to as "trimming" or changing the
  length of the video, you can change the start and end points of a video so
  viewers only see a specific "clip" of the video. For example, if you have a 20
  minute video but only want to share a five minute clip from the middle of the
  video, you can clip the video to remove the content before and after the five
  minute clip.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/video-clipping/
  md: https://developers.cloudflare.com/stream/edit-videos/video-clipping/index.md
---

With video clipping, also referred to as "trimming" or changing the length of the video, you can change the start and end points of a video so viewers only see a specific "clip" of the video. For example, if you have a 20 minute video but only want to share a five minute clip from the middle of the video, you can clip the video to remove the content before and after the five minute clip.

Refer to the [Video clipping API documentation](https://developers.cloudflare.com/api/resources/stream/subresources/clip/methods/create/) for more information.

Note:

Clipping works differently for live streams and recordings. For more information, refer to [Live instant clipping](https://developers.cloudflare.com/stream/stream-live/live-instant-clipping/).

## Prerequisites

Before you can clip a video, you will need an API token. For more information on creating an API token, refer to [Creating API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

## Required parameters

To clip your video, determine the start and end times you want to use from the existing video to create the new video. Use the `videoUID` and the start end times to make your request.

Note

Clipped videos will not inherit the `scheduledDeletion` date. To set the deletion date, you must clip the video first and then set the deletion date.

```json
{
  "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
  "startTimeSeconds": 20,
  "endTimeSeconds": 40
}
```

* **`clippedFromVideoUID`**: The unique identifier for the video used to create the new, clipped video.
* **`startTimeSeconds`**: The timestamp from the existing video that indicates when the new video begins.
* **`endTimeSeconds`**: The timestamp from the existing video that indicates when the new video ends.

```bash
curl --location --request POST 'https://api.cloudflare.com/client/v4/accounts/<YOUR_ACCOUND_ID_HERE>/stream/clip' \
--header 'Authorization: Bearer <YOUR_TOKEN_HERE>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
    "startTimeSeconds": 10,
    "endTimeSeconds": 15
    }'
```

You can check whether your video is ready to play on the **Stream** page of the Cloudflare dashboard.

[Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

While the clipped video processes, the video status response displays **Queued**. When the clipping process is complete, the video status changes to **Ready** and displays the new name of the clipped video and the new duration.

To receive a notification when your video is done processing and ready to play, you can [subscribe to webhook notifications](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/).

## Set video name

When you clip a video, you can also specify a new name for the clipped video. In the example below, the `name` field indicates the new name to use for the clipped video.

```json
{
  "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
  "startTimeSeconds": 10,
  "endTimeSeconds": 15,
  "meta": {
    "name": "overriding-filename-clip.mp4"
  }
}
```

When the video has been clipped and processed, your newly named video displays in your Cloudflare dashboard in the list videos.

## Add a watermark

You can also add a custom watermark to your video. For more information on watermarks and uploading a watermark profile, refer to [Apply watermarks](https://developers.cloudflare.com/stream/edit-videos/applying-watermarks).

```json
{
  "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
  "startTimeSeconds": 10,
  "endTimeSeconds": 15,
  "watermark": {
    "uid": "4babd675387c3d927f58c41c761978fe"
  },
  "meta": {
    "name": "overriding-filename-clip.mp4"
  }
}
```

## Require signed URLs

When clipping a video, you can make a video private and accessible only to certain users by [requiring a signed URL](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/).

```json
{
  "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
  "startTimeSeconds": 10,
  "endTimeSeconds": 15,
  "requireSignedURLs": true,
  "meta": {
    "name": "signed-urls-demo.mp4"
  }
}
```

After the video clipping is complete, you can open the Cloudflare dashboard and video list to locate your video. When you select the video, the **Settings** tab displays a checkmark next to **Require Signed URLs**.

## Specify a thumbnail image

You can also specify a thumbnail image for your video using a percentage value. To convert the thumbnail's timestamp from seconds to a percentage, divide the timestamp you want to use by the total duration of the video. For more information about thumbnails, refer to [Display thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails).

```json
{
  "clippedFromVideoUID": "0ea62994907491cf9ebefb0a34c1e2c6",
  "startTimeSeconds": 10,
  "endTimeSeconds": 15,
  "thumbnailTimestampPct": 0.5,
  "meta": {
    "name": "thumbnail_percentage.mp4"
  }
}
```

</page>

<page>
---
title: Add player enhancements · Cloudflare Stream docs
description: With player enhancements, you can modify your video player to
  incorporate elements of your branding such as your logo, and customize
  additional options to present to your viewers.
lastUpdated: 2025-09-04T14:40:32.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/edit-videos/player-enhancements/
  md: https://developers.cloudflare.com/stream/edit-videos/player-enhancements/index.md
---

With player enhancements, you can modify your video player to incorporate elements of your branding such as your logo, and customize additional options to present to your viewers.

The player enhancements are automatically applied to videos using the Stream Player, but you will need to add the details via the `publicDetails` property when using your own player.

## Properties

* `title`: The title that appears when viewers hover over the video. The title may differ from the file name of the video.
* `share_link`: Provides the user with a click-to-copy option to easily share the video URL. This is commonly set to the URL of the page that the video is embedded on.
* `channel_link`: The URL users will be directed to when selecting the logo from the video player.
* `logo`: A valid HTTPS URL for the image of your logo.

## Customize your own player

The example below includes every property you can set via `publicDetails`.

```bash
curl --location --request POST "https://api.cloudflare.com/client/v4/accounts/<$ACCOUNT_ID>/stream/<$VIDEO_UID>" \
--header "Authorization: Bearer <$SECRET>" \
--header 'Content-Type: application/json' \
--data-raw '{
    "publicDetails": {
        "title": "Optional video title",
        "share_link": "https://my-cool-share-link.cloudflare.com",
        "channel_link": "https://www.cloudflare.com/products/cloudflare-stream/",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/480px-Cloudflare_Logo.png"
    }
}' | jq ".result.publicDetails"
```

Because the `publicDetails` properties are optional, you can choose which properties to include. In the example below, only the `logo` is added to the video.

```bash
curl --location --request POST "https://api.cloudflare.com/client/v4/accounts/<$ACCOUNT_ID>/stream/<$VIDEO_UID>" \
--header "Authorization: Bearer <$SECRET>" \
--header 'Content-Type: application/json' \
--data-raw '{
    "publicDetails": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/480px-Cloudflare_Logo.png"
    }
}'
```

You can also pull the JSON by using the endpoint below.

`https://customer-<ID>.cloudflarestream.com/<VIDEO_ID>/metadata/playerEnhancementInfo.json`

## Update player properties via the Cloudflare dashboard

1. In the Cloudflare dashboard, go to the **Videos** page.

   [Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

2. Select a video from the list to edit it.

3. Select the **Public Details** tab.

4. From **Public Details**, enter information in the text fields for the properties you want to set.

5. When you are done, select **Save**.

</page>

<page>
---
title: Android (ExoPlayer) · Cloudflare Stream docs
description: Example of video playback on Android using ExoPlayer
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/android/
  md: https://developers.cloudflare.com/stream/examples/android/index.md
---

Note

Before you can play videos, you must first [upload a video to Cloudflare Stream](https://developers.cloudflare.com/stream/uploading-videos/) or be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live)

```kotlin
implementation 'com.google.android.exoplayer:exoplayer-hls:2.X.X'


SimpleExoPlayer player = new SimpleExoPlayer.Builder(context).build();


// Set the media item to the Cloudflare Stream HLS Manifest URL:
player.setMediaItem(MediaItem.fromUri("https://customer-9cbb9x7nxdw5hb57.cloudflarestream.com/8f92fe7d2c1c0983767649e065e691fc/manifest/video.m3u8"));


player.prepare();
```

### Download and run an example app

1. Download [this example app](https://github.com/googlecodelabs/exoplayer-intro.git) from the official Android developer docs, following [this guide](https://developer.android.com/codelabs/exoplayer-intro#4).
2. Open and run the [exoplayer-codelab-04 example app](https://github.com/googlecodelabs/exoplayer-intro/tree/main/exoplayer-codelab-04) using [Android Studio](https://developer.android.com/studio).
3. Replace the `media_url_dash` URL on [this line](https://github.com/googlecodelabs/exoplayer-intro/blob/main/exoplayer-codelab-04/src/main/res/values/strings.xml#L21) with the DASH manifest URL for your video.

For more, see [read the docs](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/).

</page>

<page>
---
title: dash.js · Cloudflare Stream docs
description: Example of video playback with Cloudflare Stream and the DASH
  reference player (dash.js)
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/dash-js/
  md: https://developers.cloudflare.com/stream/examples/dash-js/index.md
---

```html
<html>
  <head>
    <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
  </head>
  <body>
    <div>
      <div class="code">
        <video
          data-dashjs-player=""
          autoplay=""
          src="https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
          controls="true"
        ></video>
      </div>
    </div>
  </body>
</html>
```

Refer to the [dash.js documentation](https://github.com/Dash-Industry-Forum/dash.js/) for more information.

</page>

<page>
---
title: hls.js · Cloudflare Stream docs
description: Example of video playback with Cloudflare Stream and the HLS
  reference player (hls.js)
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/hls-js/
  md: https://developers.cloudflare.com/stream/examples/hls-js/index.md
---

```html
<html>
  <head>
    <script src="//cdn.jsdelivr.net/npm/hls.js@latest"></script>
  </head>
  <body>
    <video id="video"></video>
    <script>
      if (Hls.isSupported()) {
        const video = document.getElementById('video');
        const hls = new Hls();
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(
            'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8'
          );
        });
      }


      video.play();
    </script>
  </body>
</html>
```

Refer to the [hls.js documentation](https://github.com/video-dev/hls.js/blob/master/docs/API.md) for more information.

</page>

<page>
---
title: iOS (AVPlayer) · Cloudflare Stream docs
description: Example of video playback on iOS using AVPlayer
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/ios/
  md: https://developers.cloudflare.com/stream/examples/ios/index.md
---

Note

Before you can play videos, you must first [upload a video to Cloudflare Stream](https://developers.cloudflare.com/stream/uploading-videos/) or be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live)

```swift
import SwiftUI
import AVKit


struct MyView: View {
    // Change the url to the Cloudflare Stream HLS manifest URL
    private let player = AVPlayer(url: URL(string: "https://customer-9cbb9x7nxdw5hb57.cloudflarestream.com/8f92fe7d2c1c0983767649e065e691fc/manifest/video.m3u8")!)


    var body: some View {
        VideoPlayer(player: player)
            .onAppear() {
                player.play()
            }
    }
}


struct MyView_Previews: PreviewProvider {
    static var previews: some View {
        MyView()
    }
}
```

### Download and run an example app

1. Download [this example app](https://developer.apple.com/documentation/avfoundation/offline_playback_and_storage/using_avfoundation_to_play_and_persist_http_live_streams) from Apple's developer docs
2. Open and run the app using [Xcode](https://developer.apple.com/xcode/).
3. Search in Xcode for `m3u8`, and open the `Streams` file
4. Replace the value of `playlist_url` with the HLS manifest URL for your video.

![Screenshot of a video with Cloudflare watermark at top right](https://developers.cloudflare.com/_astro/ios-example-screenshot-edit-hls-url.CK2bGBBG_Z1npgqh.webp)

1. Click the Play button in Xcode to run the app, and play your video.

For more, see [read the docs](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/).

</page>

<page>
---
title: First Live Stream with OBS · Cloudflare Stream docs
description: Set up and start your first Live Stream using OBS (Open Broadcaster
  Software) Studio
lastUpdated: 2025-08-18T14:27:42.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/examples/obs-from-scratch/
  md: https://developers.cloudflare.com/stream/examples/obs-from-scratch/index.md
---

## Overview

Stream empowers customers and their end-users to broadcast a live stream quickly and at scale. The player can be embedded in sites and applications easily, but not everyone knows how to make a live stream because it happens in a separate application. This walkthrough will demonstrate how to start your first live stream using OBS Studio, a free live streaming application used by thousands of Stream customers. There are five required steps; you should be able to complete this walkthrough in less than 15 minutes.

### Before you start

To go live on Stream, you will need any of the following:

* A paid Stream subscription
* A Pro or Business zone plan — these include 100 minutes of video storage and 10,000 minutes of video delivery
* An enterprise contract with Stream enabled

Also, you will also need to be able to install the application on your computer.

If your computer and network connection are good enough for video calling, you should at least be able to stream something basic.

## 1. Set up a [Live Input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/)

You need a Live Input on Stream. Follow the [Start a live stream](https://developers.cloudflare.com/stream/stream-live/start-stream-live/) guide. Make note of three things:

* **RTMPS URL**, which will most likely be `rtmps://live.cloudflare.com:443/live/`
* **RTMPS Key**, which is specific to the new live input
* Whether you selected the beta "Low-Latency HLS Support" or not. For your first test, leave this *disabled.* ([What is that?](https://blog.cloudflare.com/cloudflare-stream-low-latency-hls-open-beta))

## 2. Install OBS

Download [OBS Studio](https://obsproject.com/) for Windows, macOS, or Linux. The OBS Knowledge Base includes several [installation guides](https://obsproject.com/kb/category/1), but installer defaults are generally acceptable.

## 3. First Launch OBS Configuration

When you first launch OBS, the Auto-Configuration Wizard will ask a few questions and offer recommended settings. See their [Quick Start Guide](https://obsproject.com/kb/quick-start-guide) for more details. For a quick start with Stream, use these settings:

* **Step 1: "Usage Information"**
  * Select "Optimize for streaming, recording is secondary."

* **Step 2: "Video Settings"**

  * **Base (Canvas) Resolution:** 1920x1080
  * **FPS:** "Either 60 or 30, but prefer 60 when possible"

* **Step 3: "Stream Information"**

  * **Service:** "Custom"
  * For **Server**, enter the RTMPS URL from Stream
  * For **Stream Key**, enter the RTMPS Key from Stream
  * If available, select both **"Prefer hardware encoding"** and **"Estimate bitrate with a bandwidth test."**

## 4. Set up a Stage

Add some test content to the stage in OBS. In this example, I have added a background image, a web browser (to show [time.is](https://time.is)), and an overlay of my webcam:

![OBS Stage](https://developers.cloudflare.com/_astro/obs-stage.Dp0DktA1_1QAnPX.webp)

OBS offers many different audio, video, still, and generated sources to set up your broadcast content. Use the "+" button in the "Sources" panel to add content. Check out the [OBS Sources Guide](https://obsproject.com/kb/sources-guide) for more information. For an initial test, use a source that will show some motion: try a webcam ("Video Capture Device"), a screen share ("Display Capture"), or a browser with a site that has moving content.

## 5. Go Live

Click the "Start Streaming" button on the bottom right panel under "Controls" to start a stream with default settings.

Return to the Live Input page on Stream Dash. Under "Input Status," you should see "🟢 Connected" and some connection metrics. Further down the page, you will see a test player and an embed code. For more ways to watch and embed your Live Stream, see [Watch a live stream](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/).

## 6. (Optional) Optimize Settings

Tweaking some settings in OBS can improve quality, glass-to-glass latency, or stability of the stream playback. This is particularly important if you selected the "Low-Latency HLS" beta option.

Return to OBS, click "Stop Streaming." Then click "Settings" and open the "Output" section:

![OBS Output Settings - Simple Mode](https://developers.cloudflare.com/_astro/obs-output-settings-1.Dd36CkGD_oeEY6.webp)

* Change **Output Mode** to "Advanced"

![OBS Output Settings - Advanced Mode](https://developers.cloudflare.com/_astro/obs-output-settings-2.B8WTTxox_Zu2X3j.webp)

*Your available options in the "Video Encoder" menu, as well as the resulting "Encoder Settings," may look slightly different than these because the options vary by hardware.*

* **Video Encoder:** may have several options. Start with the default selected, which was "x264" in this example. Other options to try, which will leverage improved hardware acceleration when possible, include "QuickSync H.264" or "NVIDIA NVENC." See OBS's guide to Hardware Encoding for more information. H.264 is the required output codec.

* **Rate Control:** confirm "CBR" (constant bitrate) is selected.

* **Bitrate:** depending on the content of your stream, a bitrate between 3000 Kbps and 8000 Kbps should be sufficient. Lower bitrate is more tolerant to network congestion and is suitable for content with less detail or less motion (speaker, slides, etc.) where a higher bitrate requires a more stable network connection and is best for content with lots of motion or details (events, moving cameras, video games, screen share, higher framerates).

* **Keyframe Interval**, sometimes referred to as *GOP Size*:

  * If you did *not* select Low-Latency HLS Beta, set this to 4 seconds. Raise it to 8 if your stream has stuttering or freezing.
  * If you *did* select the Low-Latency HLS Beta, set this to 2 seconds. Raise it to 4 if your stream has stuttering or freezing. Lower it to 1 if your stream has smooth playback.
  * In general, higher keyframe intervals make more efficient use of bandwidth and CPU for encoding, at the expense of higher glass-to-glass latency. Lower keyframe intervals reduce latency, but are more resource intensive and less tolerant to network disruptions and congestion.

* **Profile** and **Tuning** can be left at their default settings.

* **B Frames** (available only for some encoders) should be set to 0 for LL-HLS Beta streams.

Learn more about optimizing your live stream with [live stream recommendations](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#recommendations-requirements-and-limitations) and [live stream troubleshooting](https://developers.cloudflare.com/stream/stream-live/troubleshooting/).

## What is Next

With these steps, you have created a Live Input on Stream, broadcast a test from OBS, and you saw it played back in via the Stream built-in player in Dash. Up next, consider trying:

* Embedding your live stream into a website
* Find and replay the recording of your live stream

</page>

<page>
---
title: RTMPS playback · Cloudflare Stream docs
description: Example of sub 1s latency video playback using RTMPS and ffplay
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/rtmps_playback/
  md: https://developers.cloudflare.com/stream/examples/rtmps_playback/index.md
---

Note

Before you can play live video, you must first be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live).

Copy the RTMPS *playback* key for your live input from either:

* The **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* The [Stream API](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#use-the-api)

Paste it into the URL below, replacing `<RTMPS_PLAYBACK_KEY>`:

```sh
ffplay -analyzeduration 1 -fflags -nobuffer -sync ext 'rtmps://live.cloudflare.com:443/live/<RTMPS_PLAYBACK_KEY>'
```

For more, refer to [Play live video in native apps with less than one second latency](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/#play-live-video-in-native-apps-with-less-than-1-second-latency).

</page>

<page>
---
title: Shaka Player · Cloudflare Stream docs
description: Example of video playback with Cloudflare Stream and Shaka Player
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/shaka-player/
  md: https://developers.cloudflare.com/stream/examples/shaka-player/index.md
---

First, create a video element, using the poster attribute to set a preview thumbnail image. Refer to [Display thumbnails](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/) for instructions on how to generate a thumbnail image using Cloudflare Stream.

```html
<video
  id="video"
  width="640"
  poster="https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg"
  controls
  autoplay
></video>
```

Then listen for `DOMContentLoaded` event, create a new instance of Shaka Player, and load the manifest URI.

```javascript
// Replace the manifest URI with an HLS or DASH manifest from Cloudflare Stream
const manifestUri =
  'https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd';


document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const player = new shaka.Player(video);
  await player.load(manifestUri);
});
```

Refer to the [Shaka Player documentation](https://github.com/shaka-project/shaka-player) for more information.

</page>

<page>
---
title: SRT playback · Cloudflare Stream docs
description: Example of sub 1s latency video playback using SRT and ffplay
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/srt_playback/
  md: https://developers.cloudflare.com/stream/examples/srt_playback/index.md
---

Note

Before you can play live video, you must first be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live).

Copy the SRT Playback URL for your live input from either:

* The **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* The [Stream API](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#use-the-api)

Paste it into the URL below, replacing `<SRT_PLAYBACK_URL>`:

```sh
ffplay -analyzeduration 1 -fflags -nobuffer -probesize 32 -sync ext '<SRT_PLAYBACK_URL>'
```

For more, refer to [Play live video in native apps with less than one second latency](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/#play-live-video-in-native-apps-with-less-than-1-second-latency).

</page>

<page>
---
title: Stream Player · Cloudflare Stream docs
description: Example of video playback with the Cloudflare Stream Player
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/stream-player/
  md: https://developers.cloudflare.com/stream/examples/stream-player/index.md
---

```html
<html>
  <head> </head>
  <body>
    <div style="position: relative; padding-top: 56.25%;">
    <iframe
      src="https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/iframe?poster=https%3A%2F%2Fcustomer-f33zs165nr7gyfy4.cloudflarestream.com%2F6b9e68b07dfee8cc2d116e4c51d6a957%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
      style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
      allowfullscreen="true"
    ></iframe>
    </div>
  </body>
</html>
```

Refer to the [Using the Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/) for more information.

</page>

<page>
---
title: Video.js · Cloudflare Stream docs
description: Example of video playback with Cloudflare Stream and Video.js
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/video-js/
  md: https://developers.cloudflare.com/stream/examples/video-js/index.md
---

```html
<html>
  <head>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.10.2/video-js.min.css"
      rel="stylesheet"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.10.2/video.min.js"></script>
  </head>
  <body>
    <video-js id="vid1" controls preload="auto">
      <source
        src="https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8"
        type="application/x-mpegURL"
      />
    </video-js>


    <script>
      const vid = document.getElementById('vid1');
      const player = videojs(vid);
    </script>
  </body>
</html>
```

Refer to the [Video.js documentation](https://docs.videojs.com/) for more information.

</page>

<page>
---
title: Vidstack · Cloudflare Stream docs
description: Example of video playback with Cloudflare Stream and Vidstack
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
tags: Playback
source_url:
  html: https://developers.cloudflare.com/stream/examples/vidstack/
  md: https://developers.cloudflare.com/stream/examples/vidstack/index.md
---

## Installation

There's a few options to choose from when getting started with Vidstack, follow any of the links below to get setup. You can replace the player `src` with `https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8` to test Cloudflare Stream.

* [Angular](https://www.vidstack.io/docs/player/getting-started/installation/angular?provider=video)
* [React](https://www.vidstack.io/docs/player/getting-started/installation/react?provider=video)
* [Svelte](https://www.vidstack.io/docs/player/getting-started/installation/svelte?provider=video)
* [Vue](https://www.vidstack.io/docs/player/getting-started/installation/vue?provider=video)
* [Solid](https://www.vidstack.io/docs/player/getting-started/installation/solid?provider=video)
* [Web Components](https://www.vidstack.io/docs/player/getting-started/installation/web-components?provider=video)
* [CDN](https://www.vidstack.io/docs/player/getting-started/installation/cdn?provider=video)

## Examples

Feel free to check out [Vidstack Examples](https://github.com/vidstack/examples) for building with various JS frameworks and styling options (e.g., CSS or Tailwind CSS).

</page>

<page>
---
title: GraphQL Analytics API · Cloudflare Stream docs
description: Stream provides analytics about both live video and video uploaded
  to Stream, via the GraphQL API described below, as well as on the Stream
  Analytics page of the Cloudflare dashboard.
lastUpdated: 2025-09-09T16:21:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/
  md: https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics/index.md
---

Stream provides analytics about both live video and video uploaded to Stream, via the GraphQL API described below, as well as on the Stream **Analytics** page of the Cloudflare dashboard.

[Go to **Analytics**](https://dash.cloudflare.com/?to=/:account/stream/analytics)

The Stream Analytics API uses the Cloudflare GraphQL Analytics API, which can be used across many Cloudflare products. For more about GraphQL, rate limits, filters, and sorting, refer to the [Cloudflare GraphQL Analytics API docs](https://developers.cloudflare.com/analytics/graphql-api).

## Getting started

1. In the Cloudflare dashboard, go to the **Account API tokens** page.

   [Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

2. Generate an API token with the **Account Analytics** permission.

3. Use a GraphQL client of your choice to make your first query. [Postman](https://www.postman.com/) has a built-in GraphQL client which can help you run your first query and introspect the GraphQL schema to understand what is possible.

Refer to the sections below for available metrics, dimensions, fields, and example queries.

## Server side analytics

Stream collects data about the number of minutes of video delivered to viewers for all live and on-demand videos played via HLS or DASH, regardless of whether or not you use the [Stream Player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/).

### Filters and Dimensions

| Field | Description |
| - | - |
| `date` | Date |
| `datetime` | DateTime |
| `uid` | UID of the video |
| `clientCountryName` | ISO 3166 alpha2 country code from the client who viewed the video |
| `creator` | The [Creator ID](https://developers.cloudflare.com/stream/manage-video-library/creator-id/) associated with individual videos, if present |

Some filters, like `date`, can be used with operators, such as `gt` (greater than) and `lt` (less than), as shown in the example query below. For more advanced filtering options, refer to [filtering](https://developers.cloudflare.com/analytics/graphql-api/features/filtering/).

### Metrics

| Node | Field | Description |
| - | - | - |
| `streamMinutesViewedAdaptiveGroups` | `minutesViewed` | Minutes of video delivered |

### Example

#### Get minutes viewed by country

```graphql
query StreamGetMinutesExample($accountTag: string!, $start: Date, $end: Date) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      streamMinutesViewedAdaptiveGroups(
        filter: { date_geq: $start, date_lt: $end }
        orderBy: [sum_minutesViewed_DESC]
        limit: 100
      ) {
        sum {
          minutesViewed
        }
        dimensions {
          uid
          clientCountryName
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAygFwmAhgWwOJgQWQJYB2ICYAzgKIAe6ADgDZgAUAJCgMZsD2IBCAKigDmALhikkhQQEIANDGbiUEBKIAiKEnOZgCAEzUawAShgBvAFAwYANzxgA7pDOWrMdlx4JSjAGZ46JBCipm4c3LwCIvLu4fxCMAC+JhauruLI6PhEJKQAanaOugCCuig0CHjWYBgQ3DTeLqlWfgGQwTClJAD6gmDAogoISghynWBdAQM6uomNTZwQupAAQlCiANqkIGhdaITEZPkOYLpdquRwAMIAunOpdHh7KjAAjAAMb3cwyV9WW2jOJpNPbZQ4FE6-WZAqy6R46Uh4TgEUiA6FWEB4XSQqxsB46BCXWLQABy6DAkISX0pqWpswSQA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvEAF8gA)

```json
{
  "data": {
    "viewer": {
      "accounts": [
        {
          "streamMinutesViewedAdaptiveGroups": [
            {
              "dimensions": {
                "clientCountryName": "US",
                "uid": "73c514082b154945a753d0011e9d7525"
              },
              "sum": {
                "minutesViewed": 2234
              }
            },
            {
              "dimensions": {
                "clientCountryName": "CN",
                "uid": "73c514082b154945a753d0011e9d7525"
              },
              "sum": {
                "minutesViewed": 700
              }
            },
            {
              "dimensions": {
                "clientCountryName": "IN",
                "uid": "73c514082b154945a753d0011e9d7525"
              },
              "sum": {
                "minutesViewed": 553
              }
            }
          ]
        }
      ]
    }
  },
  "errors": null
}
```

## Pagination

GraphQL API supports seek pagination: using filters, you can specify the last video UID so the response only includes data for videos after the last video UID.

The query below will return data for 2 videos that follow video UID `5646153f8dea17f44d542a42e76cfd`:

```graphql
query StreamPaginationExample(
  $accountTag: string!
  $start: Date
  $end: Date
  $uId: string
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      videoPlaybackEventsAdaptiveGroups(
        filter: { date_geq: $start, date_lt: $end, uid_gt: $uId }
        orderBy: [uid_ASC]
        limit: 2
      ) {
        count
        sum {
          timeViewedMinutes
        }
        dimensions {
          uid
        }
      }
    }
  }
}
```

[Run in GraphQL API Explorer](https://graphql.cloudflare.com/explorer?query=I4VwpgTgngBAygFwmAhgWwAooOYEsB2KCuA9vgKIAe6ADgDZgAUAUDDACQoDGXJI+CACo4AXDADOSAtgCErDpJQQEYgCJEw89mHwATNRq0gAkvolT82ZgEoYAb3kA3XGADuke-Lbde-BOMYAM1w6BEgxOxgfPgFhbDFOHhihHBgAX1sHNmyYZ10wEgw6FCgAI24Aa3JHHX8AQV0UGmIagHEIPhoArxyYYNDw+xhGsIB9bDBgBMVlABphjVHQhJ1deZBcXXGVDhNddJ6ckgh8iAAhKDEAbQ2turgAYQBdQ+y6XDRcHYAmV8zXti+AQAiQgNCeXq9YhoMAANRc7l0AFkCCAwuIQWkQboPjpxKR8OIIZDsrdMa8sTlKQc0kA\&variables=N4IghgxhD2CuB2AXAKmA5iAXCAggYTwHkBVAOWQH0BJAERABoQBnRMAJ0SxACYAGbgGwBafiICcDEAFN4AEy59BI7kICMvSbCrzsAVgEAWAat0BmAGYAOWVLCqA7OYMHZug9zDup9gRHPyAXyA)

Here are the steps to implementing pagination:

1. Call the first query without uid\_gt filter to get the first set of videos
2. Grab the last video UID from the response from the first query
3. Call next query by specifying uid\_gt property and set it to the last video UID. This will return the next set of videos

For more on pagination, refer to the [Cloudflare GraphQL Analytics API docs](https://developers.cloudflare.com/analytics/graphql-api/features/pagination/).

## Limitations

* The maximum query interval in a single query is 31 days
* The maximum data retention period is 90 days

</page>

<page>
---
title: Get live viewer counts · Cloudflare Stream docs
description: The Stream player has full support for live viewer counts by
  default. To get the viewer count for live videos for use with third party
  players, make a GET request to the /views endpoint.
lastUpdated: 2024-08-13T19:56:56.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/getting-analytics/live-viewer-count/
  md: https://developers.cloudflare.com/stream/getting-analytics/live-viewer-count/index.md
---

The Stream player has full support for live viewer counts by default. To get the viewer count for live videos for use with third party players, make a `GET` request to the `/views` endpoint.

```bash
https://customer-<CODE>.cloudflarestream.com/<INPUT_ID>/views
```

Below is a response for a live video with several active viewers:

```json
{ "liveViewers": 113 }
```

</page>

<page>
---
title: Manage creators · Cloudflare Stream docs
description: You can set the creator field with an internal user ID at the time
  a tokenized upload URL is requested. When the video is uploaded, the creator
  property is automatically set to the internal user ID which can be used for
  analytics data or when searching for videos by a specific creator.
lastUpdated: 2024-09-24T15:46:36.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/manage-video-library/creator-id/
  md: https://developers.cloudflare.com/stream/manage-video-library/creator-id/index.md
---

You can set the creator field with an internal user ID at the time a tokenized upload URL is requested. When the video is uploaded, the creator property is automatically set to the internal user ID which can be used for analytics data or when searching for videos by a specific creator.

For basic uploads, you will need to add the Creator ID after you upload the video.

## Upload from URL

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/copy" \
--header "Authorization: Bearer <API_TOKEN>" \
--header "Content-Type: application/json" \
--data '{"url":"https://example.com/myvideo.mp4","creator": "<CREATOR_ID>","thumbnailTimestampPct":0.529241,"allowedOrigins":["example.com"],"requireSignedURLs":true,"watermark":{"uid":"ea95132c15732412d22c1476fa83f27a"}}'
```

**Response**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "allowedOrigins": ["example.com"],
    "created": "2014-01-02T02:20:00Z",
    "duration": 300,
    "input": {
      "height": 1080,
      "width": 1920
    },
    "maxDurationSeconds": 300,
    "meta": {},
    "modified": "2014-01-02T02:20:00Z",
    "uploadExpiry": "2014-01-02T02:20:00Z",
    "playback": {
      "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
      "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
    },
    "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
    "readyToStream": true,
    "requireSignedURLs": true,
    "size": 4190963,
    "status": {
      "state": "ready",
      "pctComplete": "100.000000",
      "errorReasonCode": "",
      "errorReasonText": ""
    },
    "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
    "thumbnailTimestampPct": 0.529241,
    "creator": "<CREATOR_ID>",
    "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
    "liveInput": "fc0a8dc887b16759bfd9ad922230a014",
    "uploaded": "2014-01-02T02:20:00Z",
    "watermark": {
      "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
      "size": 29472,
      "height": 600,
      "width": 400,
      "created": "2014-01-02T02:20:00Z",
      "downloadedFrom": "https://company.com/logo.png",
      "name": "Marketing Videos",
      "opacity": 0.75,
      "padding": 0.1,
      "scale": 0.1,
      "position": "center"
    }
  }
}
```

## Set default creators for videos

You can associate videos with a single creator by setting a default creator ID value, which you can later use for searching for videos by creator ID or for analytics data.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/live_inputs" \
--header "Authorization: Bearer <API_TOKEN>" \
--header "Content-Type: application/json" \
--data '{"DefaultCreator":"1234"}'
```

If you have multiple creators who start live streams, [create a live input](https://developers.cloudflare.com/stream/get-started/#step-1-create-a-live-input) for each creator who will live stream and then set a `DefaultCreator` value per input. Setting the default creator ID for each input ensures that any recorded videos streamed from the creator's input will inherit the `DefaultCreator` value.

At this time, you can only manage the default creator ID values via the API.

## Update creator in existing videos

To update the creator property in existing videos, make a `POST` request to the video object endpoint with a JSON payload specifying the creator property as show in the example below.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/<VIDEO_UID>" \
--header "Authorization: Bearer <AUTH_TOKEN>" \
--header "Content-Type: application/json" \
--data '{"creator":"test123"}'
```

## Direct creator upload

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/direct_upload" \
--header "Authorization: Bearer <AUTH_TOKEN>" \
--header "Content-Type: application/json" \
--data '{"maxDurationSeconds":300,"expiry":"2021-01-02T02:20:00Z","creator": "<CREATOR_ID>", "thumbnailTimestampPct":0.529241,"allowedOrigins":["example.com"],"requireSignedURLs":true,"watermark":{"uid":"ea95132c15732412d22c1476fa83f27a"}}'
```

**Response**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "uploadURL": "www.example.com/samplepath",
    "uid": "ea95132c15732412d22c1476fa83f27a",
    "creator": "<CREATOR_ID>",
    "watermark": {
      "uid": "ea95132c15732412d22c1476fa83f27a",
      "size": 29472,
      "height": 600,
      "width": 400,
      "created": "2014-01-02T02:20:00Z",
      "downloadedFrom": "https://company.com/logo.png",
      "name": "Marketing Videos",
      "opacity": 0.75,
      "padding": 0.1,
      "scale": 0.1,
      "position": "center"
    }
  }
}
```

## Get videos by Creator ID

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream?after=2014-01-02T02:20:00Z&before=2014-01-02T02:20:00Z&include_counts=false&creator=<CREATOR_ID>&limit=undefined&asc=false&status=downloading,queued,inprogress,ready,error" \
--header "Authorization: Bearer <API_TOKEN>"
```

**Response**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": [
    {
      "allowedOrigins": ["example.com"],
      "created": "2014-01-02T02:20:00Z",
      "duration": 300,
      "input": {
        "height": 1080,
        "width": 1920
      },
      "maxDurationSeconds": 300,
      "meta": {},
      "modified": "2014-01-02T02:20:00Z",
      "uploadExpiry": "2014-01-02T02:20:00Z",
      "playback": {
        "hls": "https://customer-<CODE>.cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/manifest/video.m3u8",
        "dash": "https://customer-<CODE>.cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/manifest/video.mpd"
      },
      "preview": "https://customer-<CODE>.cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/watch",
      "readyToStream": true,
      "requireSignedURLs": true,
      "size": 4190963,
      "status": {
        "state": "ready",
        "pctComplete": "100.000000",
        "errorReasonCode": "",
        "errorReasonText": ""
      },
      "thumbnail": "https://customer-<CODE>.cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg",
      "thumbnailTimestampPct": 0.529241,
      "creator": "some-creator-id",
      "uid": "ea95132c15732412d22c1476fa83f27a",
      "liveInput": "fc0a8dc887b16759bfd9ad922230a014",
      "uploaded": "2014-01-02T02:20:00Z",
      "watermark": {
        "uid": "ea95132c15732412d22c1476fa83f27a",
        "size": 29472,
        "height": 600,
        "width": 400,
        "created": "2014-01-02T02:20:00Z",
        "downloadedFrom": "https://company.com/logo.png",
        "name": "Marketing Videos",
        "opacity": 0.75,
        "padding": 0.1,
        "scale": 0.1,
        "position": "center"
      }
    }
  ],
  "total": "35586",
  "range": "1000"
}
```

## tus

Add the Creator ID via the `Upload-Creator` header. For more information, refer to [Resumable and large files (tus)](https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/#set-creator-property).

## Query by Creator ID with GraphQL

After you set the creator property, you can use the [GraphQL API](https://developers.cloudflare.com/analytics/graphql-api/) to filter by a specific creator. Refer to [Fetching bulk analytics](https://developers.cloudflare.com/stream/getting-analytics/fetching-bulk-analytics) for more information about available metrics and filters.

</page>

<page>
---
title: Search for videos · Cloudflare Stream docs
description: You can search for videos by name through the Stream API by adding
  a search query parameter to the list media files endpoint.
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/manage-video-library/searching/
  md: https://developers.cloudflare.com/stream/manage-video-library/searching/index.md
---

You can search for videos by name through the Stream API by adding a `search` query parameter to the [list media files](https://developers.cloudflare.com/api/resources/stream/methods/list/) endpoint.

## What you will need

To make API requests you will need a [Cloudflare API token](https://www.cloudflare.com/a/account/my-account) and your Cloudflare [account ID](https://www.cloudflare.com/a/overview/).

## cURL example

This example lists media where the name matches `puppy.mp4`.

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream?search=puppy" \
     -H "Authorization: Bearer <API_TOKEN>" \
     -H "Content-Type: application/json"
```

</page>

<page>
---
title: Use webhooks · Cloudflare Stream docs
description: Webhooks notify your service when videos successfully finish
  processing and are ready to stream or if your video enters an error state.
lastUpdated: 2026-01-28T16:30:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
  md: https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/index.md
---

Webhooks notify your service when videos successfully finish processing and are ready to stream or if your video enters an error state.

Note

Webhooks works differently for live broadcasting. For more information, refer to [Receive Live Webhooks](https://developers.cloudflare.com/stream/stream-live/webhooks/).

## Subscribe to webhook notifications

To subscribe to receive webhook notifications on your service or modify an existing subscription, generate an API token on the **Account API tokens** page of the Cloudflare dashboard.

[Go to **Account API tokens**](https://dash.cloudflare.com/?to=/:account/api-tokens)

The webhook notification URL must include the protocol. Only `http://` or `https://` is supported.

```bash
curl -X PUT --header 'Authorization: Bearer <API_TOKEN>' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/webhook \
--data '{"notificationUrl":"<WEBHOOK_NOTIFICATION_URL>"}'
```

```json
{
  "result": {
    "notificationUrl": "http://www.your-service-webhook-handler.com",
    "modified": "2019-01-01T01:02:21.076571Z"
    "secret": "85011ed3a913c6ad5f9cf6c5573cc0a7"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Notifications

When a video on your account finishes processing, you will receive a `POST` request notification with information about the video.

```json
{
 "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
 "creator": null,
 "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
 "thumbnailTimestampPct": 0,
 "readyToStream": true,
 "status": {
   "state": "ready",
   "pctComplete": "39.000000",
   "errorReasonCode": "",
   "errorReasonText": ""
 },
 "meta": {
   "filename": "small.mp4",
   "filetype": "video/mp4",
   "name": "small.mp4",
   "relativePath": "null",
   "type": "video/mp4"
 },
 "created": "2022-06-30T17:53:12.512033Z",
 "modified": "2022-06-30T17:53:21.774299Z",
 "size": 383631,
 "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
 "allowedOrigins": [],
 "requireSignedURLs": false,
 "uploaded": "2022-06-30T17:53:12.511981Z",
 "uploadExpiry": "2022-07-01T17:53:12.511973Z",
 "maxSizeBytes": null,
 "maxDurationSeconds": null,
 "duration": 5.5,
 "input": {
   "width": 560,
   "height": 320
 },
 "playback": {
   "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
   "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
 },
 "watermark": null
}
```

* `uid` – The video's unique identifier.

* `readytoStream` – Returns `true` when at least one quality level is encoded and ready to be streamed.

* `status` – The processing status.

  * `state` – Returns `ready` when a video is done processing and all quality levels are encoded.
  * `pctComplete` – The percentage of processing that is complete. When this reaches `100`, all quality levels are available.

  Tip

  If you want to ensure the highest picture quality, enable video playback only when `state` is `ready` and `pctComplete` is `100`.

* `meta` – Metadata associated with the uploaded file.

* `created` – Timestamp indicating when the video record was created.

## Error codes

If a video could not process successfully, the `state` field returns `error`, and the `errReasonCode` returns one of the values listed below.

* `ERR_NON_VIDEO` – The upload is not a video.
* `ERR_DURATION_EXCEED_CONSTRAINT` – The video duration exceeds the constraints defined in the direct creator upload.
* `ERR_FETCH_ORIGIN_ERROR` – The video failed to download from the URL.
* `ERR_MALFORMED_VIDEO` – The video is a valid file but contains corrupt data that cannot be recovered.
* `ERR_DURATION_TOO_SHORT` – The video's duration is shorter than 0.1 seconds.
* `ERR_UNKNOWN` – If Stream cannot automatically determine why the video returned an error, the `ERR_UNKNOWN` code will be used.

In addition to the `state` field, a video's `readyToStream` field must also be `true` for a video to play.

```bash
{
  "readyToStream": false,
  "status": {
    "state": "error",
    "step": "encoding",
    "pctComplete": "39",
    "errReasonCode": "ERR_MALFORMED_VIDEO",
    "errReasonText": "The video was deemed to be corrupted or malformed.",
  }
}
```

## Verify webhook authenticity

Cloudflare Stream will sign the webhook requests sent to your notification URLs and include the signature of each request in the `Webhook-Signature` HTTP header. This allows your application to verify the webhook requests are sent by Stream.

To verify a signature, you need to retrieve your webhook signing secret. This value is returned in the API response when you create or retrieve the webhook.

To verify the signature, get the value of the `Webhook-Signature` header, which will look similar to the example below.

`Webhook-Signature: time=1230811200,sig1=60493ec9388b44585a29543bcf0de62e377d4da393246a8b1c901d0e3e672404`

### 1. Parse the signature

Retrieve the `Webhook-Signature` header from the webhook request and split the string using the `,` character.

Split each value again using the `=` character.

The value for `time` is the current [UNIX time](https://en.wikipedia.org/wiki/Unix_time) when the server sent the request. `sig1` is the signature of the request body.

At this point, you should discard requests with timestamps that are too old for your application.

### 2. Create the signature source string

Prepare the signature source string and concatenate the following strings:

* Value of the `time` field for example `1230811200`
* Character `.`
* Webhook request body (complete with newline characters, if applicable)

Every byte in the request body must remain unaltered for successful signature verification.

### 3. Create the expected signature

Compute an HMAC with the SHA256 function (HMAC-SHA256) using your webhook secret and the source string from step 2. This step depends on the programming language used by your application.

Cloudflare's signature will be encoded to hex.

### 4. Compare expected and actual signatures

Compare the signature in the request header to the expected signature. Preferably, use a constant-time comparison function to compare the signatures.

If the signatures match, you can trust that Cloudflare sent the webhook.

## Limitations

* Webhooks will only be sent after video processing is complete, and the body will indicate whether the video processing succeeded or failed.
* Only one webhook subscription is allowed per-account.

## Examples

**Golang**

Using [crypto/hmac](https://golang.org/pkg/crypto/hmac/#pkg-overview):

```go
package main


import (
 "crypto/hmac"
 "crypto/sha256"
 "encoding/hex"
 "log"
)


func main() {
 secret := []byte("secret from the Cloudflare API")
 message := []byte("string from step 2")


 hash := hmac.New(sha256.New, secret)
 hash.Write(message)


 hashToCheck := hex.EncodeToString(hash.Sum(nil))


 log.Println(hashToCheck)
}
```

**Node.js**

```js
    var crypto = require('crypto');


    var key = 'secret from the Cloudflare API';
    var message = 'string from step 2';


    var hash = crypto.createHmac('sha256', key).update(message);


    hash.digest('hex');
```

**Ruby**

```ruby
    require 'openssl'


    key = 'secret from the Cloudflare API'
    message = 'string from step 2'


    OpenSSL::HMAC.hexdigest('sha256', key, message)
```

**In JavaScript (for example, to use in Cloudflare Workers)**

```javascript
    const key = 'secret from the Cloudflare API';
    const message = 'string from step 2';


    const getUtf8Bytes = str =>
      new Uint8Array(
        [...decodeURIComponent(encodeURIComponent(str))].map(c => c.charCodeAt(0))
      );


    const keyBytes = getUtf8Bytes(key);
    const messageBytes = getUtf8Bytes(message);


    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' },
      true, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);


    [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
```

</page>

<page>
---
title: Add custom ingest domains · Cloudflare Stream docs
description: With custom ingest domains, you can configure your RTMPS feeds to
  use an ingest URL that you specify instead of using live.cloudflare.com.
lastUpdated: 2026-01-14T17:05:31.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/custom-domains/
  md: https://developers.cloudflare.com/stream/stream-live/custom-domains/index.md
---

With custom ingest domains, you can configure your RTMPS feeds to use an ingest URL that you specify instead of using `live.cloudflare.com.`

Note

Custom Ingest Domains cannot be configured for domains with [zone holds](https://developers.cloudflare.com/fundamentals/account/account-security/zone-holds/) enabled.

1. In the Cloudflare dashboard, go to the **Live inputs** page.

   [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

2. Select **Settings**, above the list. The **Custom Input Domains** page displays.

3. Under **Domain**, add your domain and select **Add domain**.

4. At your DNS provider, add a CNAME record that points to `live.cloudflare.com`. If your DNS provider is Cloudflare, this step is done automatically.

If you are using Cloudflare for DNS, ensure the [**Proxy status**](https://developers.cloudflare.com/dns/proxy-status/) of your ingest domain is **DNS only** (grey-clouded).

## Delete a custom domain

1. From the **Custom Input Domains** page under **Hostnames**, locate the domain.
2. Select the menu icon under **Action**. Select **Delete**.

</page>

<page>
---
title: Download live stream videos · Cloudflare Stream docs
description: You can enable downloads for live stream videos from the Cloudflare
  dashboard. Videos are available for download after they enter the Ready state.
lastUpdated: 2025-09-04T14:40:32.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/download-stream-live-videos/
  md: https://developers.cloudflare.com/stream/stream-live/download-stream-live-videos/index.md
---

You can enable downloads for live stream videos from the Cloudflare dashboard. Videos are available for download after they enter the **Ready** state.

Note

Downloadable MP4s are only available for live recordings under four hours. Live recordings exceeding four hours can be played at a later time but cannot be downloaded as an MP4.

1. In the Cloudflare dashboard, go to the **Live inputs** page.

   [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

2. Select a live input from the list.

3. Under **Videos created by live input**, select your video.

4. Under **Settings**, select **Enable MP4 Downloads**.

5. Select **Save**. You will see a progress bar as the video generates a download link.

6. When the download link is ready, under **Download URL**, copy the URL and enter it in a browser to download the video.

</page>

<page>
---
title: DVR for Live · Cloudflare Stream docs
description: |-
  Stream Live supports "DVR mode" on an opt-in basis to allow viewers to rewind,
  resume, and fast-forward a live broadcast. To enable DVR mode, add the
  dvrEnabled=true query parameter to the Stream Player embed source or the HLS
  manifest URL.
lastUpdated: 2025-09-25T13:29:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/dvr-for-live/
  md: https://developers.cloudflare.com/stream/stream-live/dvr-for-live/index.md
---

Stream Live supports "DVR mode" on an opt-in basis to allow viewers to rewind, resume, and fast-forward a live broadcast. To enable DVR mode, add the `dvrEnabled=true` query parameter to the Stream Player embed source or the HLS manifest URL.

## Stream Player

```html
<div style="position: relative; padding-top: 56.25%;">
  <iframe
    src="https://customer-<CODE>.cloudflarestream.com/<INPUT_ID|VIDEO_ID>/iframe?dvrEnabled=true"
    style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>
</div>
```

When DVR mode is enabled the Stream Player will:

* Show a timeline the viewer can scrub/seek, similar to watching an on-demand video. The timeline will automatically scale to show the growing duration of the broadcast while it is live.
* The "LIVE" indicator will show grey if the viewer is behind the live edge or red if they are watching the latest content. Clicking that indicator will jump forward to the live edge.
* If the viewer pauses the player, it will resume playback from that time instead of jumping forward to the live edge.

## HLS manifest for custom players

```text
https://customer-<CODE>.cloudflarestream.com/<INPUT_ID|VIDEO_ID>/manifest/video.m3u8?dvrEnabled=true
```

Custom players using a DVR-capable HLS manifest may need additional configuration to surface helpful controls or information. Refer to your player library for additional information.

## Video ID or Input ID

Stream Live allows loading the Player or HLS manifest by Video ID or Live Input ID. Refer to [Watch a live stream](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/) for how to retrieve these URLs and compare these options. There are additional considerations when using DVR mode:

**Recommended:** Use DVR Mode on a Video ID URL:

* When the player loads, it will start playing the active broadcast if it is still live or play the recording if the broadcast has concluded.

DVR Mode on a Live Input ID URL:

* When the player loads, it will start playing the currently live broadcast if there is one (refer to [Live Input Status](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/#live-input-status)).
* If the viewer is still watching *after the broadcast ends,* they can continue to watch. However, if the player or manifest is then reloaded, it will show the latest broadcast or "Stream has not yet started" (`HTTP 204`). Past broadcasts are not available by Live Input ID.

## Known Limitations

* When using DVR Mode and a player/manifest created using a Live Input ID, the player may stall when trying to switch quality levels if a viewer is still watching after a broadcast has concluded.
* Performance may be degraded for DVR-enabled broadcasts longer than three hours. Manifests are limited to a maxiumum of 7,200 segments. Segment length is determined by the keyframe interval, also called GOP size.
* DVR Mode relies on Version 8 of the HLS manifest specification. Stream uses HLS Version 6 in all other contexts. HLS v8 offers extremely broad compatibility but may not work with certain old player libraries or older devices.
* DVR Mode is not available for DASH manifests.

</page>

<page>
---
title: Live Instant Clipping · Cloudflare Stream docs
description: Stream supports generating clips of live streams and recordings so
  creators and viewers alike can highlight short, engaging pieces of a longer
  broadcast or recording. Live instant clips can be created by end users and do
  not result in additional storage fees or new entries in the video library.
lastUpdated: 2025-02-14T19:42:29.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/live-instant-clipping/
  md: https://developers.cloudflare.com/stream/stream-live/live-instant-clipping/index.md
---

Stream supports generating clips of live streams and recordings so creators and viewers alike can highlight short, engaging pieces of a longer broadcast or recording. Live instant clips can be created by end users and do not result in additional storage fees or new entries in the video library.

Note:

Clipping works differently for uploaded / on-demand videos. For more information, refer to [Clip videos](https://developers.cloudflare.com/stream/edit-videos/video-clipping/).

## Prerequisites

When configuring a [Live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/), ensure "Live Playback and Recording" (`mode`) is enabled.

API keys are not needed to generate a preview or clip, but are needed to create Live Inputs.

Live instant clips are generated dynamically from the recording of a live stream. When generating clips manifests or MP4s, always reference the Video ID, not the Live Input ID. If the recording is deleted, the instant clip will no longer be available.

## Preview manifest

To help users replay and seek recent content, request a preview manifest by adding a `duration` parameter to the HLS manifest URL:

```txt
https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID||INPUT_ID>/manifest/video.m3u8?duration=5m
```

* `duration` string duration of the preview, up to 5 minutes as either a number of seconds ("30s") or minutes ("3m")

When the preview manifest is delivered, inspect the headers for two properties:

* `preview-start-seconds` float seconds into the start of the live stream or recording that the preview manifest starts. Useful in applications that allow a user to select a range from the preview because the clip will need to reference its offset from the *broadcast* start time, not the *preview* start time.
* `stream-media-id` string the video ID of the live stream or recording. Useful in applications that render the player using an *input* ID because the clip URL should reference the *video* ID.

This manifest can be played and seeked using any HLS-compatible player.

### Reading headers

Reading headers when loading a manifest requires adjusting how players handle the response. For example, if using [HLS.js](https://github.com/video-dev/hls.js) and the default loader, override the `pLoader` (playlist loader) class:

```js
let currentPreviewStart;
let currentPreviewVideoID;


// Override the pLoader (playlist loader) to read the manifest headers:
class pLoader extends Hls.DefaultConfig.loader {
  constructor(config) {
    super(config);
    var load = this.load.bind(this);
    this.load = function (context, config, callbacks) {
      if (context.type == 'manifest') {
        var onSuccess = callbacks.onSuccess;
        // copy the existing onSuccess handler to fire it later.


        callbacks.onSuccess = function (response, stats, context, networkDetails) {
          // The fourth argument here is undocumented in HLS.js but contains
          // the response object for the manifest fetch, which gives us headers:


          currentPreviewStart =
            parseFloat(networkDetails.getResponseHeader('preview-start-seconds'));
          // Save the start time of the preview manifest


          currentPreviewVideoID =
            networkDetails.getResponseHeader('stream-media-id');
          // Save the video ID in case the preview was loaded with an input ID


          onSuccess(response, stats, context);
          // And fire the exisint success handler.
        };
      }
      load(context, config, callbacks);
    };
  }
}


// Specify the new loader class when setting up HLS
const hls = new Hls({
  pLoader: pLoader,
});
```

## Clip manifest

To play a clip of a live stream or recording, request a clip manifest with a duration and a start time, relative to the start of the live stream.

```txt
https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/manifest/clip.m3u8?time=600s&duration=30s
```

* `time` string start time of the clip in seconds, from the start of the live stream or recording
* `duration` string duration of the clip in seconds, up to 60 seconds max

This manifest can be played and seeked using any HLS-compatible player.

## Clip MP4 download

An MP4 of the clip can also be generated dynamically to be saved and shared on other platforms.

```txt
https://customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/clip.mp4?time=600s&duration=30s&filename=clip.mp4
```

* `time` string start time of the clip in seconds, from the start of the live stream or recording (example: "500s")
* `duration` string duration of the clip in seconds, up to 60 seconds max (example: "60s")
* `filename` string *(optional)* a filename for the clip

</page>

<page>
---
title: Record and replay live streams · Cloudflare Stream docs
description: "Live streams are automatically recorded, and available instantly
  once a live stream ends. To get a list of recordings for a given input ID,
  make a GET request to /live_inputs/<UID>/videos and filter for videos where
  state is set to ready:"
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/replay-recordings/
  md: https://developers.cloudflare.com/stream/stream-live/replay-recordings/index.md
---

Live streams are automatically recorded, and available instantly once a live stream ends. To get a list of recordings for a given input ID, make a [`GET` request to `/live_inputs/<UID>/videos`](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/get/) and filter for videos where `state` is set to `ready`:

```bash
curl -X GET \
-H "Authorization: Bearer <API_TOKEN>" \
https://dash.cloudflare.com/api/v4/accounts/<ACCOUNT_ID>/stream/live_inputs/<LIVE_INPUT_UID>/videos
```

```json
{
  "result": [
...
    {
      "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
      "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
      "thumbnailTimestampPct": 0,
      "readyToStream": true,
      "status": {
        "state": "ready",
        "pctComplete": "100.000000",
        "errorReasonCode": "",
        "errorReasonText": ""
      },
      "meta": {
        "name": "Stream Live Test 22 Sep 21 22:12 UTC"
      },
      "created": "2021-09-22T22:12:53.587306Z",
      "modified": "2021-09-23T00:14:05.591333Z",
      "size": 0,
      "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
      "allowedOrigins": [],
      "requireSignedURLs": false,
      "uploaded": "2021-09-22T22:12:53.587288Z",
      "uploadExpiry": null,
      "maxSizeBytes": null,
      "maxDurationSeconds": null,
      "duration": 7272,
      "input": {
        "width": 640,
        "height": 360
      },
      "playback": {
        "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
        "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
      },
      "watermark": null,
      "liveInput": "34036a0695ab5237ce757ac53fd158a2"
    }
  ],
  "success": true,
  "errors": [],
  "messages": []
}
```

</page>

<page>
---
title: Simulcast (restream) videos · Cloudflare Stream docs
description: Simulcasting lets you forward your live stream to third-party
  platforms such as Twitch, YouTube, Facebook, Twitter, and more. You can
  simulcast to up to 50 concurrent destinations from each live input. To begin
  simulcasting, select an input and add one or more Outputs.
lastUpdated: 2025-09-09T16:21:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/simulcasting/
  md: https://developers.cloudflare.com/stream/stream-live/simulcasting/index.md
---

Simulcasting lets you forward your live stream to third-party platforms such as Twitch, YouTube, Facebook, Twitter, and more. You can simulcast to up to 50 concurrent destinations from each live input. To begin simulcasting, select an input and add one or more Outputs.

## Add an Output using the API

Add an Output to start retransmitting live video. You can add or remove Outputs at any time during a broadcast to start and stop retransmitting.

```bash
curl -X POST \
--data '{"url": "rtmp://a.rtmp.youtube.com/live2","streamKey": "<redacted>"}' \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/live_inputs/<INPUT_UID>/outputs
```

```json
{
  "result": {
    "uid": "6f8339ed45fe87daa8e7f0fe4e4ef776",
    "url": "rtmp://a.rtmp.youtube.com/live2",
    "streamKey": "<redacted>"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Control when you start and stop simulcasting

You can enable and disable individual live outputs with either:

* The **Live inputs** page of the Cloudflare dashboard.

  [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

* [The API](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/subresources/outputs/methods/update/)

This allows you to:

* Start a live stream, but wait to start simulcasting to YouTube and Twitch until right before the content begins.
* Stop simulcasting before the live stream ends, to encourage viewers to transition from a third-party service like YouTube or Twitch to a direct live stream.
* Give your own users manual control over when they go live to specific simulcasting destinations.

When a live output is disabled, video is not simulcast to the live output, even when actively streaming to the corresponding live input.

By default, all live outputs are enabled.

### Enable outputs from the dashboard:

1. In the Cloudflare dashboard, go to the **Live inputs** page.

   [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

2. Select an input from the list.

3. Under **Outputs** > **Enabled**, set the toggle to enabled or disabled.

## Manage outputs

| Command | Method | Endpoint |
| - | - | - |
| [List outputs](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/list/) | `GET` | `accounts/:account_identifier/stream/live_inputs` |
| [Delete outputs](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/delete/) | `DELETE` | `accounts/:account_identifier/stream/live_inputs/:live_input_identifier` |
| [List All Outputs Associated With A Specified Live Input](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/subresources/outputs/methods/list/) | `GET` | `/accounts/{account_id}/stream/live_inputs/{live_input_identifier}/outputs` |
| [Delete An Output](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/subresources/outputs/methods/delete/) | `DELETE` | `/accounts/{account_id}/stream/live_inputs/{live_input_identifier}/outputs/{output_identifier}` |

If the associated live input is already retransmitting to this output when you make the `DELETE` request, that output will be disconnected within 30 seconds.

</page>

<page>
---
title: Start a live stream · Cloudflare Stream docs
description: After you subscribe to Stream, you can create Live Inputs in Dash
  or via the API. Broadcast to your new Live Input using RTMPS or SRT. SRT
  supports newer video codecs and makes using accessibility features, such as
  captions and multiple audio tracks, easier.
lastUpdated: 2025-09-09T16:21:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/start-stream-live/
  md: https://developers.cloudflare.com/stream/stream-live/start-stream-live/index.md
---

After you subscribe to Stream, you can create Live Inputs in Dash or via the API. Broadcast to your new Live Input using RTMPS or SRT. SRT supports newer video codecs and makes using accessibility features, such as captions and multiple audio tracks, easier.

Note

Stream only supports the SRT caller mode, which is responsible for broadcasting a live stream after a connection is established.

**First time live streaming?** You will need software to send your video to Cloudflare. [Learn how to go live on Stream using OBS Studio](https://developers.cloudflare.com/stream/examples/obs-from-scratch/).

## Use the dashboard

**Step 1:** In the Cloudflare dashboard, go to the **Live inputs** page and create a live input.

[Go to **Live inputs** ](https://dash.cloudflare.com/?to=/:account/stream/inputs)![Create live input field from dashboard](https://developers.cloudflare.com/_astro/create-live-input-from-stream-dashboard.BPPM6pVj_2gg8Jz.webp)

**Step 2:** Copy the RTMPS URL and key, and use them with your live streaming application. We recommend using [Open Broadcaster Software (OBS)](https://obsproject.com/) to get started.

![Example of RTMPS URL field](https://developers.cloudflare.com/_astro/copy-rtmps-url-from-stream-dashboard.BV1iePso_2ejwaH.webp)

**Step 3:** Go live and preview your live stream in the Stream Dashboard

In the Stream Dashboard, within seconds of going live, you will see a preview of what your viewers will see. To add live video playback to your website or app, refer to [Play videos](https://developers.cloudflare.com/stream/viewing-videos).

## Use the API

To start a live stream programmatically, make a `POST` request to the `/live_inputs` endpoint:

```bash
curl -X POST \
--header "Authorization: Bearer <API_TOKEN>" \
--data '{"meta": {"name":"test stream"},"recording": { "mode": "automatic" }}' \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/live_inputs
```

```json
{
  "uid": "f256e6ea9341d51eea64c9454659e576",
  "rtmps": {
    "url": "rtmps://live.cloudflare.com:443/live/",
    "streamKey": "MTQ0MTcjM3MjI1NDE3ODIyNTI1MjYyMjE4NTI2ODI1NDcxMzUyMzcf256e6ea9351d51eea64c9454659e576"
  },
  "created": "2021-09-23T05:05:53.451415Z",
  "modified": "2021-09-23T05:05:53.451415Z",
  "meta": {
    "name": "test stream"
  },
  "status": null,
  "recording": {
    "mode": "automatic",
    "requireSignedURLs": false,
    "allowedOrigins": null,
    "hideLiveViewerCount": false
  },
  "deleteRecordingAfterDays": null,
  "preferLowLatency": false
}
```

#### Optional API parameters

[API Reference Docs for `/live_inputs`](https://developers.cloudflare.com/api/resources/stream/subresources/live_inputs/methods/create/)

* `preferLowLatency` boolean default: `false` Beta

  * When set to true, this live input will be enabled for the beta Low-Latency HLS pipeline. The Stream built-in player will automatically use LL-HLS when possible. (Recording `mode` property must also be set to `automatic`.)

* `deleteRecordingAfterDays` integer default: `null` (any)

  * Specifies a date and time when the recording, not the input, will be deleted. This property applies from the time the recording is made available and ready to stream. After the recording is deleted, it is no longer viewable and no longer counts towards storage for billing. Minimum value is `30`, maximum value is `1096`.

    When the stream ends, a `scheduledDeletion` timestamp is calculated using the `deleteRecordingAfterDays` value if present.

    Note that if the value is added to a live input while a stream is live, the property will only apply to future streams.

* `timeoutSeconds` integer default: `0`

  * The `timeoutSeconds` property specifies how long a live feed can be disconnected before it results in a new video being created.

The following four properties are nested under the `recording` object.

* `mode` string default: `off`

  * When the mode property is set to `automatic`, the live stream will be automatically available for viewing using HLS/DASH. In addition, the live stream will be automatically recorded for later replays. By default, recording mode is set to `off`, and the input will not be recorded or available for playback.

* `requireSignedURLs` boolean default: `false`

  * The `requireSignedURLs` property indicates if signed URLs are required to view the video. This setting is applied by default to all videos recorded from the input. In addition, if viewing a video via the live input ID, this field takes effect over any video-level settings.

* `allowedOrigins` integer default: `null` (any)

  * The `allowedOrigins` property can optionally be invoked to provide a list of allowed origins. This setting is applied by default to all videos recorded from the input. In addition, if viewing a video via the live input ID, this field takes effect over any video-level settings.

* `hideLiveViewerCount` boolean default: `false`

  * Restrict access to the live viewer count and remove the value from the player.

## Manage live inputs

You can update live inputs by making a `PUT` request:

```bash
curl --request PUT \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/live_inputs/{input_id} \
--header "Authorization: Bearer <API_TOKEN>" \
--data '{"meta": {"name":"test stream 1"},"recording": { "mode": "automatic", "timeoutSeconds": 10 }}'
```

Delete a live input by making a `DELETE` request:

```bash
curl --request DELETE \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/live_inputs/{input_id} \
--header "Authorization: Bearer <API_TOKEN>"
```

## Recommendations, requirements and limitations

If you are experiencing buffering, freezing, experiencing latency, or having other similar issues, visit [live stream troubleshooting](https://developers.cloudflare.com/stream/stream-live/troubleshooting/).

### Recommendations

* Your creators should use an appropriate bitrate for their live streams, typically well under 12Mbps (12000Kbps). High motion, high frame rate content typically should use a higher bitrate, while low motion content like slide presentations should use a lower bitrate.
* Your creators should use a [GOP duration](https://en.wikipedia.org/wiki/Group_of_pictures) (keyframe interval) of between 2 to 8 seconds. The default in most encoding software and hardware, including Open Broadcaster Software (OBS), is within this range. Setting a lower GOP duration will reduce latency for viewers, while also reducing encoding efficiency. Setting a higher GOP duration will improve encoding efficiency, while increasing latency for viewers. This is a tradeoff inherent to video encoding, and not a limitation of Cloudflare Stream.
* When possible, select CBR (constant bitrate) instead of VBR (variable bitrate) as CBR helps to ensure a stable streaming experience while preventing buffering and interruptions.

#### Low-Latency HLS broadcast recommendations Beta

* For lowest latency, use a GOP size (keyframe interval) of 1 or 2 seconds.
* Broadcast to the RTMP endpoint if possible.
* If using OBS, select the "ultra low" latency profile.

### Requirements

* Closed GOPs are required. This means that if there are any B frames in the video, they should always refer to frames within the same GOP. This setting is the default in most encoding software and hardware, including [OBS Studio](https://obsproject.com/).
* Stream Live only supports H.264 video and AAC audio codecs as inputs. This requirement does not apply to inputs that are relayed to Stream Connect outputs. Stream Live supports ADTS but does not presently support LATM.
* Clients must be configured to reconnect when a disconnection occurs. Stream Live is designed to handle reconnection gracefully by continuing the live stream.

### Limitations

* Watermarks cannot yet be used with live videos.
* If a live video exceeds seven days in length, the recording will be truncated to seven days. Only the first seven days of live video content will be recorded.

</page>

<page>
---
title: Stream Live API docs · Cloudflare Stream docs
lastUpdated: 2024-12-16T22:33:26.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/stream-live-api/
  md: https://developers.cloudflare.com/stream/stream-live/stream-live-api/index.md
---


</page>

<page>
---
title: Troubleshooting a live stream · Cloudflare Stream docs
description: In addition to following the live stream troubleshooting steps in
  this guide, make sure that your video settings align with Cloudflare live
  stream recommendations. If you use OBS, you can also check these OBS-specific
  recommendations.
lastUpdated: 2025-12-02T15:23:09.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/troubleshooting/
  md: https://developers.cloudflare.com/stream/stream-live/troubleshooting/index.md
---

In addition to following the live stream troubleshooting steps in this guide, make sure that your video settings align with [Cloudflare live stream recommendations](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#recommendations-requirements-and-limitations). If you use OBS, you can also check these [OBS-specific recommendations](https://developers.cloudflare.com/stream/examples/obs-from-scratch/#6-optional-optimize-settings).

## Buffering, freezing, and latency

If your live stream is buffering, freezing, experiencing latency issues, or having other similar issues, try these troubleshooting steps:

1. In the Cloudflare dashboard, go to the **Live inputs** page.

   [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

2. For the live input in use, select the **Metrics** tab.

3. Look at your **Keyframe Interval** chart.

   It should be a consistent flat line that stays between 2s and 8s. If you see an inconsistent or wavy line, or a line that is consistently below 2s or above 8s, adjust the keyframe interval (also called GOP size) in your software or service used to send the stream to Cloudflare. The exact steps for editing those settings will depend on your platform.

   * Start by setting the keyframe interval to 4s. If playback is stable but latency is still too high, lower it to 2s. If you are experiencing buffering or freezing in playback, increase it to 8s.

   * If the keyframe interval is "variable" or "automatic", change it to a specific number instead, like 4s.

   What is a keyframe interval?

   The keyframe interval (also called GOP size) is a measurement of how often keyframes are sent to Stream. A shorter keyframe interval requires more Internet bandwidth on the broadcast side, but can reduce glass-to-glass latency. A longer keyframe requires less Internet bandwidth and can reduce buffering and freezing, but can increase glass-to-glass latency.

4. Look at your **Upload-to-Duration Ratio** chart.

   It should be a consistent flat line below 90%. If you see an inconsistent or wavy line, or a line that is consistently above 100%, try the following troubleshooting steps:

   * [Check that your Internet upload speed](https://speed.cloudflare.com/) is at least 20 Mbps. If it is below 20 Mbps, use common troubleshooting steps such as restarting your router, using an Ethernet connection instead of Wi-Fi, or contacting your Internet service provider.

   * Check the video bitrate setting in the software or service you use to send the stream to Cloudflare.

     * If it is "variable", change it to "constant" with a specific number, like 8 Mbps.
     * If it is above 15 Mbps, lower it to 8 Mbps or 70% of your Internet speed, whichever is lower.

   * Follow the steps above (the keyframe interval steps) to *increase* the keyframe interval in the software or service you use to send the stream to Cloudflare.

   What is the upload-to-duration ratio?

   The upload-to-duration ratio is a measurement of how long it takes to upload a part of the stream compared to how long that part would take to play. A ratio of less than 100% means that the stream is uploading at least as fast as it would take to play, so most users should not experience buffering or freezing. A ratio of 100% or more means that your video is uploading slower than it would take to play, so it is likely that most users will experience buffering and freezing.

</page>

<page>
---
title: Watch a live stream · Cloudflare Stream docs
description: |-
  When a Live Input begins receiving a
  broadcast, a new video is automatically created if the input's mode property
  is set to automatic.
lastUpdated: 2025-09-04T14:40:32.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/watch-live-stream/
  md: https://developers.cloudflare.com/stream/stream-live/watch-live-stream/index.md
---

When a [Live Input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/) begins receiving a broadcast, a new video is automatically created if the input's `mode` property is set to `automatic`.

To watch, Stream offers a built-in Player or you use a custom player with the HLS and DASH manifests.

Note

Due to Google Chromecast limitations, Chromecast does not support audio and video delivered separately. To avoid potential issues with playback, we recommend using DASH, instead of HLS, which is a Chromecast supported use case.

## View by Live Input ID or Video ID

Whether you use the Stream Player or a custom player with a manifest, you can reference the Live Input ID or a specific Video ID. The main difference is what happens when a broadcast concludes.

Use a Live Input ID in instances where a player should always show the active broadcast, if there is one, or a "Stream has not started" message if the input is idle. This option is best for cases where a page is dedicated to a creator, channel, or recurring program. The Live Input ID is provisioned for you when you create the input; it will not change.

Use a Video ID in instances where a player should be used to display a single broadcast or its recording once the broadcast has concluded. This option is best for cases where a page is dedicated to a one-time event, specific episode/occurance, or date. There is a *new* Video ID generated for each broadcast *when it starts.*

Using DVR mode, explained below, there are additional considerations.

Stream's URLs are all templatized for easy generation:

**Stream built-in Player URL format:**

```plaintext
https://customer-<CODE>.cloudflarestream.com/<INPUT_ID|VIDEO_ID>/iframe
```

A full embed code can be generated in Dash or with the API.

**HLS Manifest URL format:**

```plaintext
https://customer-<CODE>.cloudflarestream.com/<INPUT_ID|VIDEO_ID>/manifest/video.m3u8
```

You can also retrieve the embed code or manifest URLs from Dash or the API.

## Use the dashboard

To get the Stream built-in player embed code or HLS Manifest URL for a custom player:

1. In the Cloudflare dashboard, go to the **Live inputs** page.

   [Go to **Live inputs**](https://dash.cloudflare.com/?to=/:account/stream/inputs)

2. Select a live input from the list.

3. Locate the **Embed** and **HLS Manifest URL** beneath the video.

4. Determine which option to use and then select **Click to copy** beneath your choice.

The embed code or manifest URL retrieved in Dash will reference the Live Input ID.

## Use the API

To retrieve the player code or manifest URLs via the API, fetch the Live Input's list of videos:

```bash
curl -X GET \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/live_inputs/<LIVE_INPUT_UID>/videos
```

A live input will have multiple videos associated with it, one for each broadcast. If there is an active broadcast, the first video in the response will have a `live-inprogress` status. Other videos in the response represent recordings which can be played on-demand.

Each video in the response, including the active broadcast if there is one, contains the HLS and DASH URLs and a link to the Stream player. Noteworthy properties include:

* `preview` -- Link to the Stream player to watch
* `playback`.`hls` -- HLS Manifest
* `playback`.`dash` -- DASH Manifest

In the example below, the state of the live video is `live-inprogress` and the state for previously recorded video is `ready`.

```json
{
  "result": [
    {
      "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
      "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",


      "status": {
        "state": "live-inprogress",
        "errorReasonCode": "",
        "errorReasonText": ""
      },
      "meta": {
        "name": "Stream Live Test 23 Sep 21 05:44 UTC"
      },
      "created": "2021-09-23T05:44:30.453838Z",
      "modified": "2021-09-23T05:44:30.453838Z",
      "size": 0,
      "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
      ...


      "playback": {
        "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
        "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
      },
      ...
    },
    {
      "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
      "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
      "thumbnailTimestampPct": 0,
      "readyToStream": true,
      "status": {
        "state": "ready",
        "pctComplete": "100.000000",
        "errorReasonCode": "",
        "errorReasonText": ""
      },
      "meta": {
        "name": "CFTV Staging 22 Sep 21 22:12 UTC"
      },
      "created": "2021-09-22T22:12:53.587306Z",
      "modified": "2021-09-23T00:14:05.591333Z",
      "size": 0,
      "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
      ...
      "playback": {
        "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
        "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
      },
    }
  ],
}
```

These will reference the Video ID.

## Live input status

You can check whether a live input is currently streaming and what its active video ID is by making a request to its `lifecycle` endpoint. The Stream player does this automatically to show a note when the input is idle. Custom players may require additional support.

```bash
curl -X GET \
-H "Authorization: Bearer <API_TOKEN>" \
https://customer-<CODE>.cloudflarestream.com/<INPUT_ID>/lifecycle
```

In the example below, the response indicates the `ID` is for an input with an active `videoUID`. The `live` status value indicates the input is actively streaming.

```json
{
  "isInput": true,
  "videoUID": "55b9b5ce48c3968c6b514c458959d6a",
  "live": true
}
```

```json
{
  "isInput": true,
  "videoUID": null,
  "live": false
}
```

When viewing a live stream via the live input ID, the `requireSignedURLs` and `allowedOrigins` options in the live input recording settings are used. These settings are independent of the video-level settings.

## Live stream recording playback

After a live stream ends, a recording is automatically generated and available within 60 seconds. To ensure successful video viewing and playback, keep the following in mind:

* If a live stream ends while a viewer is watching, viewers using the Stream player should wait 60 seconds and then reload the player to view the recording of the live stream.
* After a live stream ends, you can check the status of the recording via the API. When the video state is `ready`, you can use one of the manifest URLs to stream the recording.

While the recording of the live stream is generating, the video may report as `not-found` or `not-started`.

If you are not using the Stream player for live stream recordings, refer to [Record and replay live streams](https://developers.cloudflare.com/stream/stream-live/replay-recordings/) for more information on how to replay a live stream recording.

</page>

<page>
---
title: Receive Live Webhooks · Cloudflare Stream docs
description: Stream Live offers webhooks to notify your service when an Input
  connects, disconnects, or encounters an error with Stream Live.
lastUpdated: 2026-01-14T17:05:31.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/stream-live/webhooks/
  md: https://developers.cloudflare.com/stream/stream-live/webhooks/index.md
---

Stream Live offers webhooks to notify your service when an Input connects, disconnects, or encounters an error with Stream Live.

Note

Webhooks works differently for uploaded / on-demand videos. For more information, refer to [Using Webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/).

Stream Live Notifications

**Who is it for?**

Customers who are using [Stream](https://developers.cloudflare.com/stream/) and want to receive webhooks with the status of their videos.

**Other options / filters**

You can input Stream Live IDs to receive notifications only about those inputs. If left blank, you will receive a list for all inputs.

The following input states will fire notifications. You can toggle them on or off:

* `live_input.connected`
* `live_input.disconnected`

**Included with**

Stream subscription.

**What should you do if you receive one?**

Stream notifications are entirely customizable by the customer. Action will depend on the customizations enabled.

## Subscribe to Stream Live Webhooks

1. In the Cloudflare dashboard, go to the **Notifications** page.

   [Go to **Notifications**](https://dash.cloudflare.com/?to=/:account/notifications)

2. Select the **Destinations** tab.

3. On the **Destinations** page under **Webhooks**, select **Create**.

4. Enter the information for your webhook and select **Save and Test**.

5. To create the notification, from the **Notifications** page, select the **All Notifications** tab.

6. Next to **Notifications**, select **Add**.

7. Under the list of products, locate **Stream** and select **Select**.

8. Enter a name and optional description.

9. Under **Webhooks**, select **Add webhook** and select your newly created webhook.

10. Select **Next**.

11. By default, you will receive webhook notifications for all Live Inputs. If you only wish to receive webhooks for certain inputs, enter a comma-delimited list of Input IDs in the text field.

12. When you are done, select **Create**.

```json
{
  "name": "Live Webhook Test",
  "text": "Notification type: Stream Live Input\nInput ID: eb222fcca08eeb1ae84c981ebe8aeeb6\nEvent type: live_input.disconnected\nUpdated at: 2022-01-13T11:43:41.855717910Z",
  "data": {
    "notification_name": "Stream Live Input",
    "input_id": "eb222fcca08eeb1ae84c981ebe8aeeb6",
    "event_type": "live_input.disconnected",
    "updated_at": "2022-01-13T11:43:41.855717910Z"
  },
  "ts": 1642074233
}
```

The `event_type` property of the data object will either be `live_input.connected`, `live_input.disconnected`, or `live_input.errored`.

If there are issues detected with the input, the `event_type` will be `live_input.errored`. Additional data will be under the `live_input_errored` json key and will include a `code` with one of the values listed below.

## Error codes

* `ERR_GOP_OUT_OF_RANGE` – The input GOP size or keyframe interval is out of range.
* `ERR_UNSUPPORTED_VIDEO_CODEC` – The input video codec is unsupported for the protocol used.
* `ERR_UNSUPPORTED_AUDIO_CODEC` – The input audio codec is unsupported for the protocol used.
* `ERR_STORAGE_QUOTA_EXHAUSTED` – The account storage quota has been exceeded. Delete older content or purcahse additional storage.
* `ERR_MISSING_SUBSCRIPTION` – Unauthorized to start a live stream. Check subscription or log into Dash for details.

```json
{
  "name": "Live Webhook Test",
  "text": "Notification type: Stream Live Input\nInput ID: 2c28dd2cc444cb77578c4840b51e43a8\nEvent type: live_input.errored\nUpdated at: 2024-07-09T18:07:51.077371662Z\nError Code: ERR_GOP_OUT_OF_RANGE\nError Message: Input GOP size or keyframe interval is out of range.\nVideo Codec: \nAudio Codec: ",
  "data": {
    "notification_name": "Stream Live Input",
    "input_id": "eb222fcca08eeb1ae84c981ebe8aeeb6",
    "event_type": "live_input.errored",
    "updated_at": "2024-07-09T18:07:51.077371662Z",
    "live_input_errored": {
      "error": {
        "code": "ERR_GOP_OUT_OF_RANGE",
        "message": "Input GOP size or keyframe interval is out of range."
      },
      "video_codec": "",
      "audio_codec": ""
    }
  },
  "ts": 1720548474,
}
```

</page>

<page>
---
title: Define source origin · Cloudflare Stream docs
description: When optimizing remote videos, you can specify which origins can be
  used as the source for transformed videos. By default, Cloudflare accepts only
  source videos from the zone where your transformations are served.
lastUpdated: 2025-09-25T13:29:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/transform-videos/sources/
  md: https://developers.cloudflare.com/stream/transform-videos/sources/index.md
---

Media Transformations is now GA:

Billing for Media Transformations will begin on November 1st, 2025.

When optimizing remote videos, you can specify which origins can be used as the source for transformed videos. By default, Cloudflare accepts only source videos from the zone where your transformations are served.

On this page, you will learn how to define and manage the origins for the source videos that you want to optimize.

Note

The allowed origins setting applies to requests from Cloudflare Workers.

If you use a Worker to optimize remote videos via a `fetch()` subrequest, then this setting may conflict with existing logic that handles source videos.

## Configure origins

To get started, you must have [transformations enabled on your zone](https://developers.cloudflare.com/stream/transform-videos/#getting-started).

In the Cloudflare dashboard, go to **Stream** > **Transformations** and select the zone where you want to serve transformations.

In **Sources**, you can configure the origins for transformations on your zone.

![Enable allowed origins from the Cloudflare dashboard](https://developers.cloudflare.com/_astro/allowed-origins.4hu5lHws_1geX4Q.webp)

## Allow source videos only from allowed origins

You can restrict source videos to **allowed origins**, which applies transformations only to source videos from a defined list.

By default, your accepted sources are set to **allowed origins**. Cloudflare will always allow source videos from the same zone where your transformations are served.

If you request a transformation with a source video from outside your **allowed origins**, then the video will be rejected. For example, if you serve transformations on your zone `a.com` and do not define any additional origins, then `a.com/video.mp4` can be used as a source video, but `b.com/video.mp4` will return an error.

To define a new origin:

1. From **Sources**, select **Add origin**.
2. Under **Domain**, specify the domain for the source video. Only valid web URLs will be accepted.

![Add the origin for source videos in the Cloudflare dashboard](https://developers.cloudflare.com/_astro/add-origin.BtfOyoOS_1qwksq.webp)

When you add a root domain, subdomains are not accepted. In other words, if you add `b.com`, then source videos from `media.b.com` will be rejected.

To support individual subdomains, define an additional origin such as `media.b.com`. If you add only `media.b.com` and not the root domain, then source videos from the root domain (`b.com`) and other subdomains (`cdn.b.com`) will be rejected.

To support all subdomains, use the `*` wildcard at the beginning of the root domain. For example, `*.b.com` will accept source videos from the root domain (like `b.com/video.mp4`) as well as from subdomains (like `media.b.com/video.mp4` or `cdn.b.com/video.mp4`).

1. Optionally, you can specify the **Path** for the source video. If no path is specified, then source videos from all paths on this domain are accepted.

Cloudflare checks whether the defined path is at the beginning of the source path. If the defined path is not present at the beginning of the path, then the source video will be rejected.

For example, if you define an origin with domain `b.com` and path `/themes`, then `b.com/themes/video.mp4` will be accepted but `b.com/media/themes/video.mp4` will be rejected.

1. Select **Add**. Your origin will now appear in your list of allowed origins.
2. Select **Save**. These changes will take effect immediately.

When you configure **allowed origins**, only the initial URL of the source video is checked. Any redirects, including URLs that leave your zone, will be followed, and the resulting video will be transformed.

If you change your accepted sources to **any origin**, then your list of sources will be cleared and reset to default.

## Allow source videos from any origin

When your accepted sources are set to **any origin**, any publicly available video can be used as the source video for transformations on this zone.

**Any origin** is less secure and may allow third parties to serve transformations on your zone.

</page>

<page>
---
title: Troubleshooting · Cloudflare Stream docs
description: "If you are using Media Transformations to transform your video and
  you experience a failure, the response body contains an error message
  explaining the reason, as well as the Cf-Resized header containing err=code:"
lastUpdated: 2025-09-25T13:29:38.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/transform-videos/troubleshooting/
  md: https://developers.cloudflare.com/stream/transform-videos/troubleshooting/index.md
---

Media Transformations is now GA:

Billing for Media Transformations will begin on November 1st, 2025.

If you are using Media Transformations to transform your video and you experience a failure, the response body contains an error message explaining the reason, as well as the `Cf-Resized` header containing `err=code`:

* 9401 — The required options are missing or are invalid. Refer to [Options](https://developers.cloudflare.com/stream/transform-videos/#options) for supported arguments.
* 9402 — The video was too large or the origin server did not respond as expected. Refer to [source video requirements](https://developers.cloudflare.com/stream/transform-videos/#source-video-requirements) for more information.
* 9404 — The video does not exist on the origin server or the URL used to transform the video is wrong. Verify the video exists and check the URL.
* 9406 & 9419 — The video URL is a non-HTTPS URL or the URL has spaces or unescaped Unicode. Check your URL and try again.
* 9407 — A lookup error occurred with the origin server's domain name. Check your DNS settings and try again.
* 9408 — The origin server returned an HTTP 4xx status code and may be denying access to the video. Confirm your video settings and try again.
* 9412 — The origin server returned a non-video, for example, an HTML page. This usually happens when an invalid URL is specified or server-side software has printed an error or presented a login page.
* 9504 — The origin server could not be contacted because the origin server may be down or overloaded. Try again later.
* 9509 — The origin server returned an HTTP 5xx status code. This is most likely a problem with the origin server-side software, not the transformation.
* 9517 & 9523 — Internal errors. Contact support if you encounter these errors.

***

</page>

<page>
---
title: Direct creator uploads · Cloudflare Stream docs
description: Direct creator uploads let your end users upload videos directly to
  Cloudflare Stream without exposing your API token to clients.
lastUpdated: 2026-01-27T21:11:25.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/
  md: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/index.md
---

Direct creator uploads let your end users upload videos directly to Cloudflare Stream without exposing your API token to clients.

* If your video is a [basic upload](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/#basic-uploads) under 200 MB and users do not need resumable uploads, generate a URL that accepts an HTTP post request.

* If your video is over 200 MB or if you need to allow users to [resume interrupted uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/#resumable-uploads), generate a URL using the tus protocol.

In either case, you must specify a maximum duration to reserve for the user's upload to ensure it can be accommodated within your available storage.

## Basic uploads

Use this option if your users upload videos under 200 MB, and you do not need to allow resumable uploads.

1. Generate a unique, one-time upload URL using the [Direct upload API](https://developers.cloudflare.com/api/resources/stream/subresources/direct_upload/methods/create/).

```sh
curl https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/direct_upload \
--header 'Authorization: Bearer <API_TOKEN>' \
 --data '{
    "maxDurationSeconds": 3600
 }'
```

```json
{
  "result": {
    "uploadURL": "https://upload.videodelivery.net/f65014bc6ff5419ea86e7972a047ba22",
    "uid": "f65014bc6ff5419ea86e7972a047ba22"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

1. With the `uploadURL` from the previous step, users can upload video files that are limited to 200 MB in size. Refer to the example request below.

```bash
curl --request POST \
  --form file=@/Users/mickie/Downloads/example_video.mp4 \
  https://upload.videodelivery.net/f65014bc6ff5419ea86e7972a047ba22
```

A successful upload will receive a `200` HTTP status code response. If the upload does not meet the upload constraints defined at time of creation or is larger than 200 MB in size, you will receive a `4xx` HTTP status code response.

## Resumable uploads

1. Create your own API endpoint that returns an upload URL.

The example below shows how to build a Worker to get a URL you can use to upload your video. The one-time upload URL is returned in the `Location` header of the response, not in the response body.

```javascript
export async function onRequest(context) {
  const { request, env } = context;
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;


  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": request.headers.get("Upload-Length"),
      "Upload-Metadata": request.headers.get("Upload-Metadata"),
    },
  });


  const destination = response.headers.get("Location");


  return new Response(null, {
    headers: {
      "Access-Control-Expose-Headers": "Location",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      Location: destination,
    },
  });
}
```

1. Use this API endpoint **directly** in your tus client. A common mistake is to extract the upload URL from your new API endpoint, and use this directly. See below for a complete example of how to use the API from Step 1 with the uppy tus client.

```html
<html>
  <head>
    <link
      href="https://releases.transloadit.com/uppy/v3.0.1/uppy.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="drag-drop-area" style="height: 300px"></div>
    <div class="for-ProgressBar"></div>
    <button class="upload-button" style="font-size: 30px; margin: 20px">
      Upload
    </button>
    <div class="uploaded-files" style="margin-top: 50px">
      <ol></ol>
    </div>
    <script type="module">
      import {
        Uppy,
        Tus,
        DragDrop,
        ProgressBar,
      } from "https://releases.transloadit.com/uppy/v3.0.1/uppy.min.mjs";


      const uppy = new Uppy({ debug: true, autoProceed: true });


      const onUploadSuccess = (el) => (file, response) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = response.uploadURL;
        a.target = "_blank";
        a.appendChild(document.createTextNode(file.name));
        li.appendChild(a);


        document.querySelector(el).appendChild(li);
      };


      uppy
        .use(DragDrop, { target: "#drag-drop-area" })
        .use(Tus, {
          endpoint: "/api/get-upload-url",
          chunkSize: 150 * 1024 * 1024,
        })
        .use(ProgressBar, {
          target: ".for-ProgressBar",
          hideAfterFinish: false,
        })
        .on("upload-success", onUploadSuccess(".uploaded-files ol"));


      const uploadBtn = document.querySelector("button.upload-button");
      uploadBtn.addEventListener("click", () => uppy.upload());
    </script>
  </body>
</html>
```

For more details on using tus and example client code, refer to [Resumable and large files (tus)](https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/).

## Upload-Metadata header syntax

You can apply the [same constraints](https://developers.cloudflare.com/api/resources/stream/subresources/direct_upload/methods/create/) as Direct Creator Upload via basic upload when using tus. To do so, you must pass the `expiry` and `maxDurationSeconds` as part of the `Upload-Metadata` request header as part of the first request (made by the Worker in the example above.) The `Upload-Metadata` values are ignored from subsequent requests that do the actual file upload.

The `Upload-Metadata` header should contain key-value pairs. The keys are text and the values should be encoded in base64. Separate the key and values by a space, *not* an equal sign. To join multiple key-value pairs, include a comma with no additional spaces.

In the example below, the `Upload-Metadata` header is instructing Stream to only accept uploads with max video duration of 10 minutes, uploaded prior to the expiry timestamp, and to make this video private:

`'Upload-Metadata: maxDurationSeconds NjAw,requiresignedurls,expiry MjAyNC0wMi0yN1QwNzoyMDo1MFo='`

`NjAw` is the base64 encoded value for "600" (or 10 minutes). `MjAyNC0wMi0yN1QwNzoyMDo1MFo=` is the base64 encoded value for "2024-02-27T07:20:50Z" (an RFC3339 format timestamp)

## Track upload progress

After the creation of a unique one-time upload URL, you may wish to retain the unique identifier (`uid`) returned in the response to track the progress of a user's upload.

You can do that two ways:

* [Search for a video](https://developers.cloudflare.com/stream/manage-video-library/searching/) with the UID to check the status.

* [Create a webhook subscription](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/) to receive notifications about the video status. These notifications include the video's UID.

## Billing considerations

Direct Creator Upload links count towards your storage limit even if your users have not yet uploaded video to this URL. If the link expires before it is used or the upload cannot be processed, the storage reservation will be released. Otherwise, once the upload is encoded, its true duration will be counted toward storage and the reservation will be released.

For a detailed breakdown of pricing and example scenarios, refer to [Pricing](https://developers.cloudflare.com/stream/pricing/).

</page>

<page>
---
title: Player API · Cloudflare Stream docs
description: "Attributes are added in the <stream> tag without quotes, as you
  can see below:"
lastUpdated: 2025-05-08T19:52:23.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/player-api/
  md: https://developers.cloudflare.com/stream/uploading-videos/player-api/index.md
---

Attributes are added in the `<stream>` tag without quotes, as you can see below:

```plaintext
<stream attribute-added-here src="5d5bc37ffcf54c9b82e996823bffbb81"></stream>
```

Multiple attributes can be used together, added one after each other like this:

```plaintext
<stream attribute-1 attribute-2 attribute-3 src="5d5bc37ffcf54c9b82e996823bffbb81"></stream>
```

## Supported attributes

* `autoplay` boolean

  * Tells the browser to immediately start downloading the video and play it as soon as it can. Note that mobile browsers generally do not support this attribute, the user must tap the screen to begin video playback. Please consider mobile users or users with Internet usage limits as some users do not have unlimited Internet access before using this attribute.

  Note

  To disable video autoplay, the `autoplay` attribute needs to be removed altogether as this attribute. Setting `autoplay="false"` will not work; the video will autoplay if the attribute is there in the `<stream>` tag.

In addition, some browsers now prevent videos with audio from playing automatically. You may add the `mute` attribute to allow your videos to autoplay. For more information, see [new video policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/). :::

* `controls` boolean

  * Shows the default video controls such as buttons for play/pause, volume controls. You may choose to build buttons and controls that work with the player. [See an example.](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/)

* `height` integer

  * The height of the video's display area, in CSS pixels.

* `loop` boolean

  * A Boolean attribute; if included in the HTML tag, player will, automatically seek back to the start upon reaching the end of the video.

* `muted` boolean

  * A Boolean attribute which indicates the default setting of the audio contained in the video. If set, the audio will be initially silenced.

* `preload` string | null

  * This enumerated attribute is intended to provide a hint to the browser about what the author thinks will lead to the best user experience. You may choose to include this attribute as a boolean attribute without a value, or you may specify the value `preload="auto"` to preload the beginning of the video. Not including the attribute or using `preload="metadata"` will just load the metadata needed to start video playback when requested.

  Note

  The `<video>` element does not force the browser to follow the value of this attribute; it is a mere hint. Even though the `preload="none"` option is a valid HTML5 attribute, Stream player will always load some metadata to initialize the player. The amount of data loaded in this case is negligible.

* `poster` string

  * A URL for an image to be shown before the video is started or while the video is downloading. If this attribute is not specified, a thumbnail image of the video is shown.

* `src` string

  * The video id from the video you've uploaded to Cloudflare Stream should be included here.

* `width` integer

  * The width of the video's display area, in CSS pixels.

## Methods

* `play()` Promise

  * Start video playback.

* `pause()` null

  * Pause video playback.

## Properties

* `autoplay`

  * Sets or returns whether the autoplay attribute was set, allowing video playback to start upon load.

* `controls`

  * Sets or returns whether the video should display controls (like play/pause etc.)

* `currentTime`

  * Returns the current playback time in seconds. Setting this value seeks the video to a new time.

* `duration` readonly

  * Returns the duration of the video in seconds.

* `ended` readonly

  * Returns whether the video has ended.

* `loop`

  * Sets or returns whether the video should start over when it reaches the end

* `muted`

  * Sets or returns whether the audio should be played with the video

* `paused` readonly

  * Returns whether the video is paused

* `preload`

  * Sets or returns whether the video should be preloaded upon element load.

* `volume`

  * Sets or returns volume from 0.0 (silent) to 1.0 (maximum value)

## Events

### Standard video element events

Stream supports most of the [standardized media element events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events).

* `abort`

  * Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.

* `canplay`

  * Sent when enough data is available that the media can be played, at least for a couple of frames.

* `canplaythrough`

  * Sent when the entire media can be played without interruption, assuming the download rate remains at least at the current level. It will also be fired when playback is toggled between paused and playing. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.

* `durationchange`

  * The metadata has loaded or changed, indicating a change in duration of the media. This is sent, for example, when the media has loaded enough that the duration is known.

* `ended`

  * Sent when playback completes.

* `error`

  * Sent when an error occurs. (for example, the video has not finished encoding yet, or the video fails to load due to an incorrect signed URL)

* `loadeddata`

  * The first frame of the media has finished loading.

* `loadedmetadata`

  * The media's metadata has finished loading; all attributes now contain as much useful information as they are going to.

* `loadstart`

  * Sent when loading of the media begins.

* `pause`

  * Sent when the playback state is changed to paused (paused property is true).

* `play`

  * Sent when the playback state is no longer paused, as a result of the play method, or the autoplay attribute.

* `playing`

  * Sent when the media has enough data to start playing, after the play event, but also when recovering from being stalled, when looping media restarts, and after seeked, if it was playing before seeking.

* `progress`

  * Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.

* `ratechange`

  * Sent when the playback speed changes.

* `seeked`

  * Sent when a seek operation completes.

* `seeking`

  * Sent when a seek operation begins.

* `stalled`

  * Sent when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.

* `suspend`

  * Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.

* `timeupdate`

  * The time indicated by the element's currentTime attribute has changed.

* `volumechange`

  * Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).

* `waiting`

  * Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).

### Non-standard events

Non-standard events are prefixed with `stream-` to distinguish them from standard events.

* `stream-adstart`

  * Fires when `ad-url` attribute is present and the ad begins playback

* `stream-adend`

  * Fires when `ad-url` attribute is present and the ad finishes playback

* `stream-adtimeout`

  * Fires when `ad-url` attribute is present and the ad took too long to load.

</page>

<page>
---
title: Resumable and large files (tus) · Cloudflare Stream docs
description: If you have a video over 200 MB, we recommend using the tus
  protocol for resumable file uploads. A resumable upload ensures that the
  upload can be interrupted and resumed without uploading the previous data
  again.
lastUpdated: 2025-05-16T16:37:37.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/
  md: https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/index.md
---

If you have a video over 200 MB, we recommend using the [tus protocol](https://tus.io/) for resumable file uploads. A resumable upload ensures that the upload can be interrupted and resumed without uploading the previous data again.

## Requirements

* Resumable uploads require a minimum chunk size of 5,242,880 bytes unless the entire file is less than this amount. For better performance when the client connection is expected to be reliable, increase the chunk size to 52,428,800 bytes.
* Maximum chunk size is 209,715,200 bytes.
* Chunk size must be divisible by 256 KiB (256x1024 bytes). Round your chunk size to the nearest multiple of 256 KiB. Note that the final chunk of an upload that fits within a single chunk is exempt from this requirement.

## Prerequisites

Before you can upload a video using tus, you will need to download a tus client.

For more information, refer to the [tus Python client](https://github.com/tus/tus-py-client) which is available through pip, Python's package manager.

```python
pip install -U tus.py
```

## Upload a video using tus

```sh
tus-upload --chunk-size 52428800 --header \
Authorization "Bearer <API_TOKEN>"
<PATH_TO_VIDEO> https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream
```

```sh
INFO Creating file endpoint
INFO Created: https://api.cloudflare.com/client/v4/accounts/d467d4f0fcbcd9791b613bc3a9599cdc/stream/dd5d531a12de0c724bd1275a3b2bc9c6
...
```

### Golang example

Before you begin, import a tus client such as [go-tus](https://github.com/eventials/go-tus) to upload from your Go applications.

The `go-tus` library does not return the response headers to the calling function, which makes it difficult to read the video ID from the `stream-media-id` header. As a workaround, create a [Direct Creator Upload](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) link. That API response will include the TUS endpoint as well as the video ID. Setting a Creator ID is not required.

```go
package main


import (
  "net/http"
  "os"


  tus "github.com/eventials/go-tus"
)


func main() {
  accountID := "<ACCOUNT_ID>"


  f, err := os.Open("videofile.mp4")


  if err != nil {
    panic(err)
  }


  defer f.Close()


  headers := make(http.Header)
  headers.Add("Authorization", "Bearer <API_TOKEN>")


  config := &tus.Config{
    ChunkSize:           50 * 1024 * 1024, // Required a minimum chunk size of 5 MB, here we use 50 MB.
    Resume:              false,
    OverridePatchMethod: false,
    Store:               nil,
    Header:              headers,
    HttpClient:          nil,
  }


  client, _ := tus.NewClient("https://api.cloudflare.com/client/v4/accounts/"+ accountID +"/stream", config)


  upload, _ := tus.NewUploadFromFile(f)


  uploader, _ := client.CreateUpload(upload)


  uploader.Upload()
}
```

You can also get the progress of the upload if you are running the upload in a goroutine.

```go
// returns the progress percentage.
upload.Progress()


// returns whether or not the upload is complete.
upload.Finished()
```

Refer to [go-tus](https://github.com/eventials/go-tus) for functionality such as resuming uploads.

### Node.js example

Before you begin, install the tus-js-client.

* npm

  ```sh
  npm i tus-js-client
  ```

* yarn

  ```sh
  yarn add tus-js-client
  ```

* pnpm

  ```sh
  pnpm add tus-js-client
  ```

Create an `index.js` file and configure:

* The API endpoint with your Cloudflare Account ID.
* The request headers to include an API token.

```js
var fs = require("fs");
var tus = require("tus-js-client");


// Specify location of file you would like to upload below
var path = __dirname + "/test.mp4";
var file = fs.createReadStream(path);
var size = fs.statSync(path).size;
var mediaId = "";


var options = {
  endpoint: "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream",
  headers: {
    Authorization: "Bearer <API_TOKEN>",
  },
  chunkSize: 50 * 1024 * 1024, // Required a minimum chunk size of 5 MB. Here we use 50 MB.
  retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails.
  metadata: {
    name: "test.mp4",
    filetype: "video/mp4",
    // Optional if you want to include a watermark
    // watermark: '<WATERMARK_UID>',
  },
  uploadSize: size,
  onError: function (error) {
    throw error;
  },
  onProgress: function (bytesUploaded, bytesTotal) {
    var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
    console.log(bytesUploaded, bytesTotal, percentage + "%");
  },
  onSuccess: function () {
    console.log("Upload finished");
  },
  onAfterResponse: function (req, res) {
    return new Promise((resolve) => {
      var mediaIdHeader = res.getHeader("stream-media-id");
      if (mediaIdHeader) {
        mediaId = mediaIdHeader;
      }
      resolve();
    });
  },
};


var upload = new tus.Upload(file, options);
upload.start();
```

## Specify upload options

The tus protocol allows you to add optional parameters in the [`Upload-Metadata` header](https://tus.io/protocols/resumable-upload.html#upload-metadata).

### Supported options in `Upload-Metadata`

Setting arbitrary metadata values in the `Upload-Metadata` header sets values in the [meta key in Stream API](https://developers.cloudflare.com/api/resources/stream/methods/list/).

* `name`

  * Setting this key will set `meta.name` in the API and display the value as the name of the video in the dashboard.

* `requiresignedurls`

  * If this key is present, the video playback for this video will be required to use signed URLs after upload.

* `scheduleddeletion`

  * Specifies a date and time when a video will be deleted. After a video is deleted, it is no longer viewable and no longer counts towards storage for billing. The specified date and time cannot be earlier than 30 days or later than 1,096 days from the video's created timestamp.

* `allowedorigins`

  * An array of strings listing origins allowed to display the video. This will set the [allowed origins setting](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#security-considerations) for the video.

* `thumbnailtimestamppct`

  * Specify the default thumbnail [timestamp percentage](https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/). Note that percentage is a floating point value between 0.0 and 1.0.

* `watermark`

  * The watermark profile UID.

## Set creator property

Setting a creator value in the `Upload-Creator` header can be used to identify the creator of the video content, linking the way you identify your users or creators to videos in your Stream account.

For examples of how to set and modify the creator ID, refer to [Associate videos with creators](https://developers.cloudflare.com/stream/manage-video-library/creator-id/).

## Get the video ID when using tus

When an initial tus request is made, Stream responds with a URL in the `Location` header. While this URL may contain the video ID, it is not recommend to parse this URL to get the ID.

Instead, you should use the `stream-media-id` HTTP header in the response to retrieve the video ID.

For example, a request made to `https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream` with the tus protocol will contain a HTTP header like the following:

```plaintext
stream-media-id: cab807e0c477d01baq20f66c3d1dfc26cf
```

</page>

<page>
---
title: Upload with a link · Cloudflare Stream docs
description: If you have videos stored in a cloud storage bucket, you can pass a
  HTTP link for the file, and Stream will fetch the file on your behalf.
lastUpdated: 2025-04-04T15:30:48.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/upload-via-link/
  md: https://developers.cloudflare.com/stream/uploading-videos/upload-via-link/index.md
---

If you have videos stored in a cloud storage bucket, you can pass a HTTP link for the file, and Stream will fetch the file on your behalf.

## Make an HTTP request

Make a `POST` request to the Stream API using the link to your video.

```bash
curl \
--data '{"url":"https://storage.googleapis.com/zaid-test/Watermarks%20Demo/cf-ad-original.mp4","meta":{"name":"My First Stream Video"}}' \
--header "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/copy
```

## Check video status

Stream must download and encode the video, which can take a few seconds to a few minutes depending on the length of your video.

When the `readyToStream` value returns `true`, your video is ready for streaming.

You can optionally use [webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/) which will notify you when the video is ready to stream or if an error occurs.

```json
{
  "result": {
    "uid": "6b9e68b07dfee8cc2d116e4c51d6a957",
    "thumbnail": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg",
    "thumbnailTimestampPct": 0,
    "readyToStream": false,
    "status": {
      "state": "downloading"
    },
    "meta": {
      "downloaded-from": "https://storage.googleapis.com/zaid-test/Watermarks%20Demo/cf-ad-original.mp4",
      "name": "My First Stream Video"
    },
    "created": "2020-10-16T20:20:17.872170843Z",
    "modified": "2020-10-16T20:20:17.872170843Z",
    "size": 9032701,
    "preview": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/watch",
    "allowedOrigins": [],
    "requireSignedURLs": false,
    "uploaded": "2020-10-16T20:20:17.872170843Z",
    "uploadExpiry": null,
    "maxSizeBytes": 0,
    "maxDurationSeconds": 0,
    "duration": -1,
    "input": {
      "width": -1,
      "height": -1
    },
    "playback": {
      "hls": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8",
      "dash": "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd"
    },
    "watermark": null
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

After the video is uploaded, you can use the video `uid` shown in the example response above to play the video using the [Stream video player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/).

If you are using your own player or rendering the video in a mobile app, refer to [using your own player](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/).

</page>

<page>
---
title: Display thumbnails · Cloudflare Stream docs
description: A thumbnail from your video can be generated using a special link
  where you specify the time from the video you'd like to get the thumbnail
  from.
lastUpdated: 2025-05-08T19:52:23.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/
  md: https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/index.md
---

Note

Stream thumbnails are not supported for videos with non-square pixels.

## Use Case 1: Generating a thumbnail on-the-fly

A thumbnail from your video can be generated using a special link where you specify the time from the video you'd like to get the thumbnail from.

`https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg?time=1s&height=270`

![Example of thumbnail image generated from example video](https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg?time=1s\&height=270)

Using the `poster` query parameter in the embed URL, you can set a thumbnail to any time in your video. If [signed URLs](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/) are required, you must use a signed URL instead of video UIDs.

```html
<iframe
  src="https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/iframe?poster=https%3A%2F%2Fcustomer-f33zs165nr7gyfy4.cloudflarestream.com%2F6b9e68b07dfee8cc2d116e4c51d6a957%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
  style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

Supported URL attributes are:

* **`time`** (default `0s`, configurable) time from the video for example `8m`, `5m2s`

* **`height`** (default `640`)

* **`width`** (default `640`)

* **`fit`** (default `crop`) to clarify what to do when requested height and width does not match the original upload, which should be one of:

  * **`crop`** cut parts of the video that doesn't fit in the given size
  * **`clip`** preserve the entire frame and decrease the size of the image within given size
  * **`scale`** distort the image to fit the given size
  * **`fill`** preserve the entire frame and fill the rest of the requested size with black background

## Use Case 2: Set the default thumbnail timestamp using the API

By default, the Stream Player sets the thumbnail to the first frame of the video. You can change this on a per-video basis by setting the "thumbnailTimestampPct" value using the API:

```bash
curl -X POST \
-H "Authorization: Bearer <API_TOKEN>" \
-d '{"thumbnailTimestampPct": 0.5}' \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>
```

`thumbnailTimestampPct` is a value between 0.0 (the first frame of the video) and 1.0 (the last frame of the video). For example, you wanted the thumbnail to be the frame at the half way point of your videos, you can set the `thumbnailTimestampPct` value to 0.5. Using relative values in this way allows you to set the default thumbnail even if you or your users' videos vary in duration.

## Use Case 3: Generating animated thumbnails

Stream supports animated GIFs as thumbnails. Viewing animated thumbnails does not count toward billed minutes delivered or minutes viewed in [Stream Analytics](https://developers.cloudflare.com/stream/getting-analytics/).

### Animated GIF thumbnails

`https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.gif?time=1s&height=200&duration=4s`

![Animated gif example, generated on-demand from Cloudflare Stream](https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.gif?time=1s\&height=200\&duration=4s)

Supported URL attributes for animated thumbnails are:

* **`time`** (default `0s`) time from the video for example `8m`, `5m2s`

* **`height`** (default `640`)

* **`width`** (default `640`)

* **`fit`** (default `crop`) to clarify what to do when requested height and width does not match the original upload, which should be one of:

  * **`crop`** cut parts of the video that doesn't fit in the given size
  * **`clip`** preserve the entire frame and decrease the size of the image within given size
  * **`scale`** distort the image to fit the given size
  * **`fill`** preserve the entire frame and fill the rest of the requested size with black background

* **`duration`** (default `5s`)

* **`fps`** (default `8`)

</page>

<page>
---
title: Basic video uploads · Cloudflare Stream docs
description: For files smaller than 200 MB, you can use simple form-based uploads.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/
  md: https://developers.cloudflare.com/stream/uploading-videos/upload-video-file/index.md
---

## Basic Uploads

For files smaller than 200 MB, you can use simple form-based uploads.

## Upload through the Cloudflare dashboard

1. In the Cloudflare dashboard, go to the **Stream** page.

   [Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

2. Drag and drop your video into the **Quick upload** area. You can also click to browse for the file on your machine.

After the video finishes uploading, the video appears in the list.

## Upload with the Stream API

Make a `POST` request with the `content-type` header set to `multipart/form-data` and include the media as an input with the name set to `file`.

```bash
curl --request POST \
--header "Authorization: Bearer <API_TOKEN>" \
--form file=@/Users/user_name/Desktop/my-video.mp4 \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream
```

Note

Note that cURL's `--form` flag automatically configures the `content-type` header and maps `my-video.mp4` to a form input called `file`.

</page>

<page>
---
title: Download video or audio · Cloudflare Stream docs
description: >-
  When you upload a video to Stream, it can be streamed using HLS/DASH. However,
  for certain use-cases, you may want to download the MP4 or M4A file.

  For cases such as offline viewing, you may want to download the MP4 file.
  Whereas, for downstream tasks like AI summarization, if you want to extract
  only the audio, downloading an M4A file may be more useful.
lastUpdated: 2025-08-28T20:47:10.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/download-videos/
  md: https://developers.cloudflare.com/stream/viewing-videos/download-videos/index.md
---

When you upload a video to Stream, it can be streamed using HLS/DASH. However, for certain use-cases, you may want to download the MP4 or M4A file. For cases such as offline viewing, you may want to download the MP4 file. Whereas, for downstream tasks like AI summarization, if you want to extract only the audio, downloading an M4A file may be more useful.

## Generate downloadable MP4 files

Note

The `/downloads` endpoint defaults to creating an MP4 download.

You can enable MP4 support on a per video basis by following the steps below:

1. Enable MP4 support by making a POST request to the `/downloads` or `/downloads/default` endpoint.
2. Save the MP4 URL provided by the response to the endpoint. This MP4 URL will become functional when the MP4 is ready in the next step.
3. Poll the `/downloads` endpoint until the `status` field is set to `ready` to inform you when the MP4 is available. You can now use the MP4 URL from step 2.

You can enable downloads for an uploaded video once it is ready to view by making an HTTP request to either the `/downloads` or `/downloads/default` endpoint.

To get notified when a video is ready to view, refer to [Using webhooks](https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/#notifications).

## Generate downloadable M4A files

To enable M4A support on a per video basis, follow steps similar to that of generating an MP4 download, but instead send a POST request to the `/downloads/audio` endpoint.

## Examples

The downloads API response will include download type for the video, the download URL, and the processing status of the download file.

Separate requests would be needed to generate a downloadable MP4 and M4A file, respectively. For example:

```bash
curl -X POST \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/downloads
```

```json
{
  "result": {
    "default": {
      "status": "inprogress",
      "url": "https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/default.mp4",
      "percentComplete": 75.0
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

And for an M4A file:

```json
curl -X POST \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/downloads/audio
```

```json
{
  "result": {
    "audio": {
      "status": "inprogress",
      "url": "https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/audio.m4a",
      "percentComplete": 75.0
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Get download links

You can view all available downloads for a video by making a `GET` HTTP request to the downloads API.

```bash
curl -X GET \
-H "Authorization: Bearer <API_TOKEN>" \
https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/stream/<VIDEO_UID>/downloads
```

```json
{
  "result": {
    "audio": {
      "status": "ready",
      "url": "https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/audio.m4a",
      "percentComplete": 100.0
    }
    "default": {
      "status": "ready",
      "url": "https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/default.mp4",
      "percentComplete": 100.0
    }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Customize download file name

You can customize the name of downloadable files by adding the `filename` query string parameter at the end of the URL.

In the example below, adding `?filename=MY_VIDEO.mp4` to the URL will change the file name to `MY_VIDEO.mp4`.

`https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/default.mp4?filename=MY_VIDEO.mp4`

The `filename` can be a maximum of 120 characters long and composed of `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_` characters. The extension (.mp4) is appended automatically.

## Retrieve downloads

The generated MP4 download files can be retrieved via the link in the download API response.

```sh
curl -L https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/downloads/default.mp4 > download.mp4
```

## Secure video downloads

If your video is public, the MP4 will also be publicly accessible. If your video is private and requires a signed URL for viewing, the MP4 will not be publicly accessible. To access the MP4 for a private video, you can generate a signed URL just as you would for regular viewing with an additional flag called `downloadable` set to `true`.

Download links will not work for videos which already require signed URLs if the `downloadable` flag is not present in the token.

For more details about using signed URLs with videos, refer to [Securing your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/).

**Example token payload**

```json
{
    "sub": <VIDEO_UID>,
    "kid": <KEY_ID>,
    "exp": 1537460365,
    "nbf": 1537453165,
    "downloadable": true,
    "accessRules": [
      {
        "type": "ip.geoip.country",
        "action": "allow",
        "country": [
          "GB"
        ]
      },
      {
        "type": "any",
        "action": "block"
      }
    ]
  }
```

## Billing for MP4 downloads

MP4 downloads are billed in the same way as streaming of the video. You will be billed for the duration of the video each time the MP4 for the video is downloaded. For example, if you have a 10 minute video that is downloaded 100 times during the month, the downloads will count as 1000 minutes of minutes served.

You will not incur any additional cost for storage when you enable MP4s.

</page>

<page>
---
title: Secure your Stream · Cloudflare Stream docs
description: By default, videos on Stream can be viewed by anyone with just a
  video id. If you want to make your video private by default and only give
  access to certain users, you can use the signed URL feature. When you mark a
  video to require signed URL, it can no longer be accessed publicly with only
  the video id. Instead, the user will need a signed url token to watch or
  download the video.
lastUpdated: 2026-01-28T16:27:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
  md: https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/index.md
---

## Signed URLs / Tokens

By default, videos on Stream can be viewed by anyone with just a video id. If you want to make your video private by default and only give access to certain users, you can use the signed URL feature. When you mark a video to require signed URL, it can no longer be accessed publicly with only the video id. Instead, the user will need a signed url token to watch or download the video.

Here are some common use cases for using signed URLs:

* Restricting access so only logged in members can watch a particular video
* Let users watch your video for a limited time period (ie. 24 hours)
* Restricting access based on geolocation

### Making a video require signed URLs

Turn on `requireSignedURLs` to protect a video using signed URLs. This option will prevent *any public links*, such as `customer-<CODE>.cloudflarestream.com/<VIDEO_ID>/watch` or the built-in player, from working.

Restricting viewing can be done by updating the video's metadata.

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_uid}" \
--header "Authorization: Bearer <API_TOKEN>" \
--header "Content-Type: application/json"
--data "{\"uid\": \"<VIDEO_UID>\", \"requireSignedURLs\": true }"
```

Response:

```json
{
  "result": {
    "uid": "<VIDEO_UID>",
    ...
    "requireSignedURLs": true
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

## Two Ways to Generate Signed Tokens

You can program your app to generate tokens in two ways:

* **Low-volume or testing: Use the `/token` endpoint to generate a short-lived signed token.** This is recommended for testing purposes or if you are generating less than 1,000 tokens per day. It requires making an API call to Cloudflare for each token, *which is subject to [rate limiting](https://developers.cloudflare.com/fundamentals/api/reference/limits/).* The default result is valid for 1 hour. This method does not support [Live WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/).

* **Recommended: Use a signing key to create tokens.** If you have thousands of daily users or need to generate a high volume of tokens, as with [Live WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/), you can create tokens yourself using a signing key. This way, you do not need to call a Stream API each time you need to generate a token, and is therefore *not* a rate-limited operation.

## Option 1: Using the /token endpoint

You can call the `/token` endpoint for any video that is marked private to get a signed URL token which expires in one hour. This method does not support [Live WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/).

```bash
curl --request POST \
https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_uid}/token \
--header "Authorization: Bearer <API_TOKEN>"
```

You will see a response similar to this if the request succeeds:

```json
{
  "result": {
    "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkYzkzNTk4MmY4MDc1ZjJlZjk2MTA2ZDg1ZmNkODM4In0.eyJraWQiOiJjZGM5MzU5ODJmODA3NWYyZWY5NjEwNmQ4NWZjZDgzOCIsImV4cCI6IjE2MjE4ODk2NTciLCJuYmYiOiIxNjIxODgyNDU3In0.iHGMvwOh2-SuqUG7kp2GeLXyKvMavP-I2rYCni9odNwms7imW429bM2tKs3G9INms8gSc7fzm8hNEYWOhGHWRBaaCs3U9H4DRWaFOvn0sJWLBitGuF_YaZM5O6fqJPTAwhgFKdikyk9zVzHrIJ0PfBL0NsTgwDxLkJjEAEULQJpiQU1DNm0w5ctasdbw77YtDwdZ01g924Dm6jIsWolW0Ic0AevCLyVdg501Ki9hSF7kYST0egcll47jmoMMni7ujQCJI1XEAOas32DdjnMvU8vXrYbaHk1m1oXlm319rDYghOHed9kr293KM7ivtZNlhYceSzOpyAmqNFS7mearyQ"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

To render the video or use assets like manifests or thumbnails, use the `token` value in place of the video/input ID. For example, to use the Stream player, replace the ID between `cloudflarestream.com/` and `/iframe` with the token: `https://customer-<CODE>.cloudflarestream.com/<TOKEN>/iframe`.

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkYzkzNTk4MmY4MDc1ZjJlZjk2MTA2ZDg1ZmNkODM4In0.eyJraWQiOiJjZGM5MzU5ODJmODA3NWYyZWY5NjEwNmQ4NWZjZDgzOCIsImV4cCI6IjE2MjE4ODk2NTciLCJuYmYiOiIxNjIxODgyNDU3In0.iHGMvwOh2-SuqUG7kp2GeLXyKvMavP-I2rYCni9odNwms7imW429bM2tKs3G9INms8gSc7fzm8hNEYWOhGHWRBaaCs3U9H4DRWaFOvn0sJWLBitGuF_YaZM5O6fqJPTAwhgFKdikyk9zVzHrIJ0PfBL0NsTgwDxLkJjEAEULQJpiQU1DNm0w5ctasdbw77YtDwdZ01g924Dm6jIsWolW0Ic0AevCLyVdg501Ki9hSF7kYST0egcll47jmoMMni7ujQCJI1XEAOas32DdjnMvU8vXrYbaHk1m1oXlm319rDYghOHed9kr293KM7ivtZNlhYceSzOpyAmqNFS7mearyQ/iframe"
  style="border: none;"
  height="720"
  width="1280"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

Similarly, if you are using your own player, retrieve the HLS or DASH manifest by replacing the video ID in the manifest URL with the `token` value:

* `https://customer-<CODE>.cloudflarestream.com/<TOKEN>/manifest/video.m3u8`
* `https://customer-<CODE>.cloudflarestream.com/<TOKEN>/manifest/video.mpd`

### Customizing default restrictions

If you call the `/token` endpoint without any body, it will return a token that expires in one hour without any other restrictions or access to [downloads](https://developers.cloudflare.com/stream/viewing-videos/download-videos/). This token can be customized by providing additional properties in the request:

```javascript
  const signed_url_restrictions = {
    // Extend the lifetime of the token to 12 hours:
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    // Allow access to MP4 or Audio Download URLs:
    downloadable: true,
    // Geo or IP access restrictions:
    accessRules: {
      // ... see examples below
    }
  };


  const init = {
    method: "POST",
    headers: {
      Authorization: "Bearer <API_TOKEN>",
      "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(signed_url_restrictions),
  };


  const signedurl_service_response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_uid}/token",
    init,
  );


  return new Response(
    JSON.stringify(await signedurl_service_response.json()),
    { status: 200 },
  );
```

However, if you are generating tokens programmatically or adding customizations like these, it is faster and more scalable to use a signing key and generate the token within your application entirely.

## Option 2: Using a signing key to create signed tokens

If you are generating a high-volume of tokens, using [Live WebRTC](https://developers.cloudflare.com/stream/webrtc-beta/), or need to customize the access rules, generate new tokens using a signing key so you do not need to call the Stream API each time.

### Step 1: Call the `/stream/key` endpoint *once* to obtain a key

```bash
curl --request POST \
"https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/keys" \
--header "Authorization: Bearer <API_TOKEN>"
```

The response will return `pem` and `jwk` values.

```json
{
  "result": {
    "id": "8f926b2b01f383510025a78a4dcbf6a",
    "pem": "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcEFJQkFBS0NBUUVBemtHbXhCekFGMnBIMURiWmgyVGoyS3ZudlBVTkZmUWtNeXNCbzJlZzVqemRKTmRhCmtwMEphUHhoNkZxOTYveTBVd0lBNjdYeFdHb3kxcW1CRGhpdTVqekdtYW13NVgrYkR3TEdTVldGMEx3QnloMDYKN01Rb0xySHA3MDEycXBVNCtLODUyT1hMRVVlWVBrOHYzRlpTQ2VnMVdLRW5URC9oSmhVUTFsTmNKTWN3MXZUbQpHa2o0empBUTRBSFAvdHFERHFaZ3lMc1Vma2NsRDY3SVRkZktVZGtFU3lvVDVTcnFibHNFelBYcm9qaFlLWGk3CjFjak1yVDlFS0JCenhZSVEyOVRaZitnZU5ya0t4a2xMZTJzTUFML0VWZkFjdGkrc2ZqMkkyeEZKZmQ4aklmL2UKdHBCSVJZVDEza2FLdHUyYmk0R2IrV1BLK0toQjdTNnFGODlmTHdJREFRQUJBb0lCQUYzeXFuNytwNEtpM3ZmcgpTZmN4ZmRVV0xGYTEraEZyWk1mSHlaWEFJSnB1MDc0eHQ2ZzdqbXM3Tm0rTFVhSDV0N3R0bUxURTZacy91RXR0CjV3SmdQTjVUaFpTOXBmMUxPL3BBNWNmR2hFN1pMQ2wvV2ZVNXZpSFMyVDh1dGlRcUYwcXpLZkxCYk5kQW1MaWQKQWl4blJ6UUxDSzJIcmlvOW1KVHJtSUUvZENPdG80RUhYdHpZWjByOVordHRxMkZrd3pzZUdaK0tvd09JaWtvTgp2NWFOMVpmRGhEVG0wdG1Vd0tLbjBWcmZqalhRdFdjbFYxTWdRejhwM2xScWhISmJSK29PL1NMSXZqUE16dGxOCm5GV1ZEdTRmRHZsSjMyazJzSllNL2tRVUltT3V5alY3RTBBcm5vR2lBREdGZXFxK1UwajluNUFpNTJ6aTBmNloKdFdvwdju39xOFJWQkwxL2tvWFVmYk00S04ydVFadUdjaUdGNjlCRDJ1S3o1eGdvTwowVTBZNmlFNG9Cek5GUW5hWS9kayt5U1dsQWp2MkgraFBrTGpvZlRGSGlNTmUycUVNaUFaeTZ5cmRkSDY4VjdIClRNRllUQlZQaHIxT0dxZlRmc00vRktmZVhWY1FvMTI1RjBJQm5iWjNSYzRua1pNS0hzczUyWE1DZ1lFQTFQRVkKbGIybDU4blVianRZOFl6Uk1vQVo5aHJXMlhwM3JaZjE0Q0VUQ1dsVXFZdCtRN0NyN3dMQUVjbjdrbFk1RGF3QgpuTXJsZXl3S0crTUEvU0hlN3dQQkpNeDlVUGV4Q3YyRW8xT1loMTk3SGQzSk9zUythWWljemJsYmJqU0RqWXVjCkdSNzIrb1FlMzJjTXhjczJNRlBWcHVibjhjalBQbnZKd0k5aUpGVUNnWUVBMjM3UmNKSEdCTjVFM2FXLzd3ekcKbVBuUm1JSUczeW9UU0U3OFBtbHo2bXE5eTVvcSs5aFpaNE1Fdy9RbWFPMDF5U0xRdEY4QmY2TFN2RFh4QWtkdwpWMm5ra0svWWNhWDd3RHo0eWxwS0cxWTg3TzIwWWtkUXlxdjMybG1lN1JuVDhwcVBDQTRUWDloOWFVaXh6THNoCkplcGkvZFhRWFBWeFoxYXV4YldGL3VzQ2dZRUFxWnhVVWNsYVlYS2dzeUN3YXM0WVAxcEwwM3h6VDR5OTBOYXUKY05USFhnSzQvY2J2VHFsbGVaNCtNSzBxcGRmcDM5cjIrZFdlemVvNUx4YzBUV3Z5TDMxVkZhT1AyYk5CSUpqbwpVbE9ldFkwMitvWVM1NjJZWVdVQVNOandXNnFXY21NV2RlZjFIM3VuUDVqTVVxdlhRTTAxNjVnV2ZiN09YRjJyClNLYXNySFVDZ1lCYmRvL1orN1M3dEZSaDZlamJib2h3WGNDRVd4eXhXT2ZMcHdXNXdXT3dlWWZwWTh4cm5pNzQKdGRObHRoRXM4SHhTaTJudEh3TklLSEVlYmJ4eUh1UG5pQjhaWHBwNEJRNTYxczhjR1Z1ZSszbmVFUzBOTDcxZApQL1ZxUWpySFJrd3V5ckRFV2VCeEhUL0FvVEtEeSt3OTQ2SFM5V1dPTGJvbXQrd3g0NytNdWc9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=",
    "jwk": "eyJ1c2UiOiJzaWciLCJrdHkiOiJSU0EiLCJraWQiOiI4ZjkyNmIyYjAxZjM4MzUxNzAwMjVhNzhhNGRjYmY2YSIsImFsZyI6IlJTMjU2IiwibiI6InprR214QnpBRjJwSDFEYlpoMlRqMkt2bnZQVU5GZlFrTXlzQm8yZWc1anpkSk5kYWtwMEphUHhoNkZxOTZfeTBVd0lBNjdYeFdHb3kxcW1CRGhpdTVqekdtYW13NVgtYkR3TEdTVldGMEx3QnloMDY3TVFvTHJIcDcwMTJxcFU0LUs4NTJPWExFVWVZUGs4djNGWlNDZWcxV0tFblREX2hKaFVRMWxOY0pNY3cxdlRtR2tqNHpqQVE0QUhQX3RxRERxWmd5THNVZmtjbEQ2N0lUZGZLVWRrRVN5b1Q1U3JxYmxzRXpQWHJvamhZS1hpNzFjak1yVDlFS0JCenhZSVEyOVRaZi1nZU5ya0t4a2xMZTJzTUFMX0VWZkFjdGktc2ZqMkkyeEZKZmQ4aklmX2V0cEJJUllUMTNrYUt0dTJiaTRHYi1XUEstS2hCN1M2cUY4OWZMdyIsImUiOiJBUUFCIiwiZCI6IlhmS3FmdjZuZ3FMZTktdEo5ekY5MVJZc1ZyWDZFV3RreDhmSmxjQWdtbTdUdmpHM3FEdU9henMyYjR0Um9mbTN1MjJZdE1UcG16LTRTMjNuQW1BODNsT0ZsTDJsX1VzNy1rRGx4OGFFVHRrc0tYOVo5VG0tSWRMWlB5NjJKQ29YU3JNcDhzRnMxMENZdUowQ0xHZEhOQXNJcllldUtqMllsT3VZZ1Q5MEk2MmpnUWRlM05oblN2MW42MjJyWVdURE94NFpuNHFqQTRpS1NnMl9sbzNWbDhPRU5PYlMyWlRBb3FmUld0LU9OZEMxWnlWWFV5QkRQeW5lVkdxRWNsdEg2Zzc5SXNpLU04ek8yVTJjVlpVTzdoOE8tVW5mYVRhd2xnei1SQlFpWTY3S05Yc1RRQ3VlZ2FJQU1ZVjZxcjVUU1Ai2odx5iT0xSX3BtMWFpdktyUSIsInAiOiI5X1o5ZUpGTWI5X3E4UlZCTDFfa29YVWZiTTRLTjJ1UVp1R2NpR0Y2OUJEMnVLejV4Z29PMFUwWTZpRTRvQnpORlFuYVlfZGsteVNXbEFqdjJILWhQa0xqb2ZURkhpTU5lMnFFTWlBWnk2eXJkZEg2OFY3SFRNRllUQlZQaHIxT0dxZlRmc01fRktmZVhWY1FvMTI1RjBJQm5iWjNSYzRua1pNS0hzczUyWE0iLCJxIjoiMVBFWWxiMmw1OG5VYmp0WThZelJNb0FaOWhyVzJYcDNyWmYxNENFVENXbFVxWXQtUTdDcjd3TEFFY243a2xZNURhd0JuTXJsZXl3S0ctTUFfU0hlN3dQQkpNeDlVUGV4Q3YyRW8xT1loMTk3SGQzSk9zUy1hWWljemJsYmJqU0RqWXVjR1I3Mi1vUWUzMmNNeGNzMk1GUFZwdWJuOGNqUFBudkp3STlpSkZVIiwiZHAiOiIyMzdSY0pIR0JONUUzYVdfN3d6R21QblJtSUlHM3lvVFNFNzhQbWx6Nm1xOXk1b3EtOWhaWjRNRXdfUW1hTzAxeVNMUXRGOEJmNkxTdkRYeEFrZHdWMm5ra0tfWWNhWDd3RHo0eWxwS0cxWTg3TzIwWWtkUXlxdjMybG1lN1JuVDhwcVBDQTRUWDloOWFVaXh6THNoSmVwaV9kWFFYUFZ4WjFhdXhiV0ZfdXMiLCJkcSI6InFaeFVVY2xhWVhLZ3N5Q3dhczRZUDFwTDAzeHpUNHk5ME5hdWNOVEhYZ0s0X2NidlRxbGxlWjQtTUswcXBkZnAzOXIyLWRXZXplbzVMeGMwVFd2eUwzMVZGYU9QMmJOQklKam9VbE9ldFkwMi1vWVM1NjJZWVdVQVNOandXNnFXY21NV2RlZjFIM3VuUDVqTVVxdlhRTTAxNjVnV2ZiN09YRjJyU0thc3JIVSIsInFpIjoiVzNhUDJmdTB1N1JVWWVubzIyNkljRjNBaEZzY3NWam55NmNGdWNGanNIbUg2V1BNYTU0dS1MWFRaYllSTFBCOFVvdHA3UjhEU0NoeEhtMjhjaDdqNTRnZkdWNmFlQVVPZXRiUEhCbGJudnQ1M2hFdERTLTlYVF8xYWtJNngwWk1Mc3F3eEZuZ2NSMF93S0V5Zzh2c1BlT2gwdlZsamkyNkpyZnNNZU9fakxvIn0=",
    "created": "2021-06-15T21:06:54.763937286Z"
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

These values will not be shown again so we recommend saving them securely right away. If you are using Cloudflare Workers, you can store them using [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/). If you are using another platform, store them in secure environment variables.

You will use these values later to generate the tokens. The pem and jwk fields are base64-encoded, you must decode them before using them (an example of this is shown in step 2).

### Step 2: Generate tokens using the key

Once you generate the key in step 1, you can use the `pem` or `jwk` values to generate self-signing URLs on your own. Using this method, you do not need to call the Stream API each time you are creating a new token.

Here's an example Cloudflare Worker script which generates tokens that expire in 60 minutes and only work for users accessing the video from UK. In lines 2 and 3, you will configure the `id` and `jwk` values from step 1:

```javascript
// Global variables
const jwkKey = "{PRIVATE-KEY-IN-JWK-FORMAT}";
const keyID = "<KEY_ID>";
const videoUID = "<VIDEO_UID>";
// expiresTimeInS is the expired time in second of the video
const expiresTimeInS = 3600;


// Main function
async function streamSignedUrl() {
  const encoder = new TextEncoder();
  const expiresIn = Math.floor(Date.now() / 1000) + expiresTimeInS;
  const headers = {
    alg: "RS256",
    kid: keyID,
  };
  const data = {
    sub: videoUID,
    kid: keyID,
    exp: expiresIn,
    // Add `downloadable` boolean for access to MP4 or Audio Downloads:
    // downloadable: true,
    accessRules: [
      {
        type: "ip.geoip.country",
        action: "allow",
        country: ["GB"],
      },
      {
        type: "any",
        action: "block",
      },
    ],
  };


  const token = `${objectToBase64url(headers)}.${objectToBase64url(data)}`;


  const jwk = JSON.parse(atob(jwkKey));


  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );


  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    encoder.encode(token),
  );


  const signedToken = `${token}.${arrayBufferToBase64Url(signature)}`;


  return signedToken;
}


// Utilities functions
function arrayBufferToBase64Url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}


function objectToBase64url(payload) {
  return arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
}
```

### Step 3: Rendering the video

If you are using the Stream Player, insert the `token` value returned by the Worker in Step 2 in place of the `video id`, replacing the entire string located between `cloudflarestream.com/` and `/iframe`:

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkYzkzNTk4MmY4MDc1ZjJlZjk2MTA2ZDg1ZmNkODM4In0.eyJraWQiOiJjZGM5MzU5ODJmODA3NWYyZWY5NjEwNmQ4NWZjZDgzOCIsImV4cCI6IjE2MjE4ODk2NTciLCJuYmYiOiIxNjIxODgyNDU3In0.iHGMvwOh2-SuqUG7kp2GeLXyKvMavP-I2rYCni9odNwms7imW429bM2tKs3G9INms8gSc7fzm8hNEYWOhGHWRBaaCs3U9H4DRWaFOvn0sJWLBitGuF_YaZM5O6fqJPTAwhgFKdikyk9zVzHrIJ0PfBL0NsTgwDxLkJjEAEULQJpiQU1DNm0w5ctasdbw77YtDwdZ01g924Dm6jIsWolW0Ic0AevCLyVdg501Ki9hSF7kYST0egcll47jmoMMni7ujQCJI1XEAOas32DdjnMvU8vXrYbaHk1m1oXlm319rDYghOHed9kr293KM7ivtZNlhYceSzOpyAmqNFS7mearyQ/iframe"
  style="border: none;"
  height="720"
  width="1280"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

If you are using your own player, replace the video id in the manifest url with the `token` value:

`https://customer-<CODE>.cloudflarestream.com/eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkYzkzNTk4MmY4MDc1ZjJlZjk2MTA2ZDg1ZmNkODM4In0.eyJraWQiOiJjZGM5MzU5ODJmODA3NWYyZWY5NjEwNmQ4NWZjZDgzOCIsImV4cCI6IjE2MjE4ODk2NTciLCJuYmYiOiIxNjIxODgyNDU3In0.iHGMvwOh2-SuqUG7kp2GeLXyKvMavP-I2rYCni9odNwms7imW429bM2tKs3G9INms8gSc7fzm8hNEYWOhGHWRBaaCs3U9H4DRWaFOvn0sJWLBitGuF_YaZM5O6fqJPTAwhgFKdikyk9zVzHrIJ0PfBL0NsTgwDxLkJjEAEULQJpiQU1DNm0w5ctasdbw77YtDwdZ01g924Dm6jIsWolW0Ic0AevCLyVdg501Ki9hSF7kYST0egcll47jmoMMni7ujQCJI1XEAOas32DdjnMvU8vXrYbaHk1m1oXlm319rDYghOHed9kr293KM7ivtZNlhYceSzOpyAmqNFS7mearyQ/manifest/video.m3u8`

To allow access to [MP4 or audio downloads](https://developers.cloudflare.com/stream/viewing-videos/download-videos/), make sure the video has the download type already enabled. Then add `downloadable: true` to the payload as shown in the comment above when generating the signed URL. Replace the video id in the download URL with the `token` value:

* `https://customer-<CODE>.cloudflarestream.com/eyJhbGciOiJ.../downloads/default.mp4`

### Revoking keys

You can create up to 1,000 keys and rotate them at your convenience. Once revoked all tokens created with that key will be invalidated.

```bash
curl --request DELETE \
"https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/keys/{key_id}" \
--header "Authorization: Bearer <API_TOKEN>"


# Response:
{
  "result": "Revoked",
  "success": true,
  "errors": [],
  "messages": []
}
```

## Supported Restrictions

| Property Name | Description | |
| - | - | - |
| exp | Expiration. A unix epoch timestamp after which the token will stop working. Cannot be greater than 24 hours in the future from when the token is signed | |
| nbf | *Not Before* value. A unix epoch timestamp before which the token will not work | |
| downloadable | if true, the token can be used to download the mp4 (assuming the video has downloads enabled) | |
| accessRules | An array that specifies one or more ip and geo restrictions. accessRules are evaluated first-to-last. If a Rule matches, the associated action is applied and no further rules are evaluated. A token may have at most 5 members in the accessRules array. | |

### accessRules Schema

Each accessRule must include 2 required properties:

* `type`: supported values are `any`, `ip.src` and `ip.geoip.country`
* `action`: support values are `allow` and `block`

Depending on the rule type, accessRules support 2 additional properties:

* `country`: an array of 2-letter country codes in [ISO 3166-1 Alpha 2](https://www.iso.org/obp/ui/#search) format.
* `ip`: an array of ip ranges. It is recommended to include both IPv4 and IPv6 variants in a rule if possible. Having only a single variant in a rule means that rule will ignore the other variant. For example, an IPv4-based rule will never be applicable to a viewer connecting from an IPv6 address. CIDRs should be preferred over specific IP addresses. Some devices, such as mobile, may change their IP over the course of a view. Video Access Control are evaluated continuously while a video is being viewed. As a result, overly strict IP rules may disrupt playback.

***Example 1: Block views from a specific country***

```txt
...
"accessRules": [
  {
    "type": "ip.geoip.country",
    "action": "block",
    "country": ["US", "DE", "MX"],
  },
]
```

The first rule matches on country, US, DE, and MX here. When that rule matches, the block action will have the token considered invalid. If the first rule doesn't match, there are no further rules to evaluate. The behavior in this situation is to consider the token valid.

***Example 2: Allow only views from specific country or IPs***

```txt
...
"accessRules": [
  {
    "type": "ip.geoip.country",
    "country": ["US", "MX"],
    "action": "allow",
  },
  {
    "type": "ip.src",
    "ip": ["93.184.216.0/24", "2400:cb00::/32"],
    "action": "allow",
  },
  {
    "type": "any",
    "action": "block",
  },
]
```

The first rule matches on country, US and MX here. When that rule matches, the allow action will have the token considered valid. If it doesn't match we continue evaluating rules

The second rule is an IP rule matching on CIDRs, 93.184.216.0/24 and 2400:cb00::/32. When that rule matches, the allow action will consider the rule valid.

If the first two rules don't match, the final rule of any will match all remaining requests and block those views.

## Security considerations

### Hotlinking Protection

By default, Stream embed codes can be used on any domain. If needed, you can limit the domains a video can be embedded on from the Stream dashboard.

In the dashboard, you will see a text box by each video labeled `Enter allowed origin domains separated by commas`. If you click on it, you can list the domains that the Stream embed code should be able to be used on. \`

* `*.badtortilla.com` covers `a.badtortilla.com`, `a.b.badtortilla.com` and does not cover `badtortilla.com`
* `example.com` does not cover [www.example.com](http://www.example.com) or any subdomain of example.com
* `localhost` requires a port if it is not being served over HTTP on port 80 or over HTTPS on port 443
* There is no path support - `example.com` covers `example.com/\*`

You can also control embed limitation programmatically using the Stream API. `uid` in the example below refers to the video id.

```bash
curl https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_uid} \
--header "Authorization: Bearer <API_TOKEN>" \
--data "{\"uid\": \"<VIDEO_UID>\", \"allowedOrigins\": [\"example.com\"]}"
```

### Allowed Origins

The Allowed Origins feature lets you specify which origins are allowed for playback. This feature works even if you are using your own video player. When using your own video player, Allowed Origins restricts which domain the HLS/DASH manifests and the video segments can be requested from.

### Signed URLs

Combining signed URLs with embedding restrictions allows you to strongly control how your videos are viewed. This lets you serve only trusted users while preventing the signed URL from being hosted on an unknown site.

</page>

<page>
---
title: Use your own player · Cloudflare Stream docs
description: Cloudflare Stream is compatible with all video players that support
  HLS and DASH, which are standard formats for streaming media with broad
  support across all web browsers, mobile operating systems and media streaming
  devices.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/index.md
---

Cloudflare Stream is compatible with all video players that support HLS and DASH, which are standard formats for streaming media with broad support across all web browsers, mobile operating systems and media streaming devices.

Platform-specific guides:

* [Web](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/web/)
* [iOS (AVPlayer)](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/)
* [Android (ExoPlayer)](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/android/)

## Fetch HLS and Dash manifests

### URL

Each video and live stream has its own unique HLS and DASH manifest. You can access the manifest by replacing `<UID>` with the UID of your video or live input, and replacing `<CODE>` with your unique customer code, in the URLs below:

```txt
https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.m3u8
```

```txt
https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.mpd
```

#### LL-HLS playback Beta

If a Live Inputs is enabled for the Low-Latency HLS beta, add the query string `?protocol=llhls` to the HLS manifest URL to test the low latency manifest in a custom player. Refer to [Start a Live Stream](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#use-the-api) to enable this option.

```txt
https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.m3u8?protocol=llhls
```

### Dashboard

1. In the Cloudflare dashboard, go to the **Stream** page.

   [Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

2. From the list of videos, locate your video and select it.

3. From the **Settings** tab, locate the **HLS Manifest URL** and **Dash Manifest URL**.

4. Select **Click to copy** under the option you want to use.

### API

Refer to the [Stream video details API documentation](https://developers.cloudflare.com/api/resources/stream/methods/get/) to learn how to fetch the manifest URLs using the Cloudflare API.

## Customize manifests by specifying available client bandwidth

Each HLS and DASH manifest provides multiple resolutions of your video or live stream. Your player contains adaptive bitrate logic to estimate the viewer's available bandwidth, and select the optimal resolution to play. Each player has different logic that makes this decision, and most have configuration options to allow you to customize or override either bandwidth or resolution.

If your player lacks such configuration options or you need to override them, you can add the `clientBandwidthHint` query param to the request to fetch the manifest file. This should be used only as a last resort — we recommend first using customization options provided by your player. Remember that while you may be developing your website or app on a fast Internet connection, and be tempted to use this setting to force high quality playback, many of your viewers are likely connecting over slower mobile networks.

* `clientBandwidthHint` float
  * Return only the video representation closest to the provided bandwidth value (in Mbps). This can be used to enforce a specific quality level. If you specify a value that would cause an invalid or empty manifest to be served, the hint is ignored.

Refer to the example below to display only the video representation with a bitrate closest to 1.8 Mbps.

```txt
https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8?clientBandwidthHint=1.8
```

## Play live video in native apps with less than 1 second latency

If you need ultra low latency, and your users view live video in native apps, you can stream live video with [**glass-to-glass latency of less than 1 second**](https://blog.cloudflare.com/magic-hdmi-cable/), by using SRT or RTMPS for playback.

![Diagram showing SRT and RTMPS playback via the Cloudflare Network](https://developers.cloudflare.com/_astro/stream-rtmps-srt-playback-magic-hdmi-cable.D_FiXuDG_GmHW7.webp)

SRT and RTMPS playback is built into [ffmpeg](https://ffmpeg.org/). You will need to integrate ffmpeg with your own video player —  neither [AVPlayer (iOS)](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/) nor [ExoPlayer (Android)](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/android/) natively support SRT or RTMPS playback.

Note

Stream only supports the SRT caller mode, which is responsible for broadcasting a live stream after a connection is established.

We recommend using [ffmpeg-kit](https://github.com/arthenica/ffmpeg-kit) as a cross-platform wrapper for ffmpeg.

### Examples

* [RTMPS Playback with ffplay](https://developers.cloudflare.com/stream/examples/rtmps_playback/)
* [SRT playback with ffplay](https://developers.cloudflare.com/stream/examples/srt_playback/)

</page>

<page>
---
title: Use the Stream Player · Cloudflare Stream docs
description: Cloudflare provides a customizable web player that can play both
  on-demand and live video, and requires zero additional engineering work.
lastUpdated: 2025-11-17T14:08:01.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/index.md
---

Cloudflare provides a customizable web player that can play both on-demand and live video, and requires zero additional engineering work.

To add the Stream Player to a web page, you can either:

* Generate an embed code on the **Stream** page of the Cloudflare dashboard for a specific video or live input.

  [Go to **Videos**](https://dash.cloudflare.com/?to=/:account/stream/videos)

* Use the code example below, replacing `<VIDEO_UID>` with the video UID (or [signed token](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)) and `<CODE>` with the your unique customer code, which can be found in the Stream Dashboard.

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
  style="border: none"
  height="720"
  width="1280"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

Stream player is also available as a [React](https://www.npmjs.com/package/@cloudflare/stream-react) or [Angular](https://www.npmjs.com/package/@cloudflare/stream-angular) component.

## Player Size

### Fixed Dimensions

Changing the `height` and `width` attributes on the `iframe` will change the pixel value dimensions of the iframe displayed on the host page.

```html
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
  style="border: none"
  height="400"
  width="400"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>
```

### Responsive

To make an iframe responsive, it needs styles to enforce an aspect ratio by setting the `iframe` to `position: absolute;` and having it fill a container that uses a calculated `padding-top` percentage.

```html
<!-- padding-top calculation is height / width (assuming 16:9 aspect ratio) -->
<div style="position: relative; padding-top: 56.25%">
  <iframe
    src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
    style="border: none; position: absolute; top: 0; height: 100%; width: 100%"
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen="true"
  ></iframe>
</div>
```

## Basic Options

Player options are configured with querystring parameters in the iframe's `src` attribute. For example:

`https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe?autoplay=true&muted=true`

* `autoplay` default: `false`

  * If the autoplay flag is included as a querystring parameter, the player will attempt to autoplay the video. If you don't want the video to autoplay, don't include the autoplay flag at all (instead of setting it to `autoplay=false`.) Note that mobile browsers generally do not support this attribute, the user must tap the screen to begin video playback. Please consider mobile users or users with Internet usage limits as some users don't have unlimited Internet access before using this attribute.

    Warning

    Some browsers now prevent videos with audio from playing automatically. You may set `muted` to `true` to allow your videos to autoplay. For more information, refer to [New `<video>` Policies for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/).

* `controls` default: `true`

  * Shows video controls such as buttons for play/pause, volume controls.

* `defaultTextTrack`

  * Will initialize the player with the specified language code's text track enabled. The value should be the BCP-47 language code that was used to [upload the text track](https://developers.cloudflare.com/stream/edit-videos/adding-captions/). If the specified language code has no captions available, the player will behave as though no language code had been provided.

    Warning

    This will *only* work once during initialization. Beyond that point the user has full control over their text track settings.

* `letterboxColor`

  * Any valid [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) provided will be applied to the letterboxing/pillarboxing of the player's UI. This can be set to `transparent` to avoid letterboxing/pillarboxing when not in fullscreen mode.

    Note

    **Note:** Like all query string parameters, this value *must* be URI encoded. For example, the color value `hsl(120 80% 95%)` can be encoded using JavaScript's `encodeURIComponent()` function to `hsl(120%2080%25%2095%25)`.

* `loop` default: `false`

  * If enabled the player will automatically seek back to the start upon reaching the end of the video.

* `muted` default: `false`

  * If set, the audio will be initially silenced.

* `preload` default: `none`

  * This enumerated option is intended to provide a hint to the browser about what the author thinks will lead to the best user experience. You may specify the value `preload="auto"` to preload the beginning of the video. Not including the option or using `preload="metadata"` will just load the metadata needed to start video playback when requested.

    Note

    The `<video>` element does not force the browser to follow the value of this option; it is a mere hint. Even though the `preload="none"` option is a valid HTML5 option, Stream player will always load some metadata to initialize the player. The amount of data loaded in this case is negligible.

* `poster` defaults to the first frame of the video

  * A URL for an image to be shown before the video is started or while the video is downloading. If this attribute isn't specified, a thumbnail image of the video is shown.

    Note

    **Note:** Like all query string parameters, this value *must* be URI encoded. For example, the thumbnail at `https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg?time=1s&height=270` can be encoded using JavaScript's `encodeURIComponent()` function to `https%3A%2F%2Fcustomer-f33zs165nr7gyfy4.cloudflarestream.com%2F6b9e68b07dfee8cc2d116e4c51d6a957%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D1s%26height%3D600`.

* `primaryColor`

  * Any valid [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) provided will be applied to certain elements of the player's UI.

    Note

    **Note:** Like all query string parameters, this value *must* be URI encoded. For example, the color value `hsl(120 80% 95%)` can be encoded using JavaScript's `encodeURIComponent()` function to `hsl(120%2080%25%2095%25)`.

* `src`

  * The video id from the video you've uploaded to Cloudflare Stream should be included here.

* `startTime`

  * A timestamp that specifies the time when playback begins. If a plain number is used such as `?startTime=123`, it will be interpreted as `123` seconds. More human readable timestamps can also be used, such as `?startTime=1h12m27s` for `1 hour, 12 minutes, and 27 seconds`.

* `ad-url`

  * The Stream Player supports VAST Tags to insert ads such as prerolls. If you have a VAST tag URI, you can pass it to the Stream Player by setting the `ad-url` parameter. The URI must be encoded using a function like JavaScript's `encodeURIComponent()`.

## Debug Info

The Stream player Debug menu can be shown and hidden using the key combination `Shift-D` while the video is playing.

## Live stream recording playback

After a live stream ends, a recording is automatically generated and available within 60 seconds. To ensure successful video viewing and playback, keep the following in mind:

* If a live stream ends while a viewer is watching, viewers should wait 60 seconds and then reload the player to view the recording of the live stream.
* After a live stream ends, you can check the status of the recording via the API. When the video state is `ready`, you can use one of the manifest URLs to stream the recording.

While the recording of the live stream is generating, the video may report as `not-found` or `not-started`.

## Low-Latency HLS playback Beta

If a Live Inputs is enabled for the Low-Latency HLS beta, the Stream player will automatically play in low-latency mode if possible. Refer to [Start a Live Stream](https://developers.cloudflare.com/stream/stream-live/start-stream-live/#use-the-api) to enable this option.

</page>

<page>
---
title: Android · Cloudflare Stream docs
description: You can stream both on-demand and live video to native Android apps
  using ExoPlayer.
lastUpdated: 2025-08-20T20:59:04.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/android/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/android/index.md
---

You can stream both on-demand and live video to native Android apps using [ExoPlayer](https://exoplayer.dev/).

Note

Before you can play videos, you must first [upload a video to Cloudflare Stream](https://developers.cloudflare.com/stream/uploading-videos/) or be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live)

## Example Apps

* [Android](https://developers.cloudflare.com/stream/examples/android/)

## Using ExoPlayer

Play a video from Cloudflare Stream using ExoPlayer:

```kotlin
implementation 'com.google.android.exoplayer:exoplayer-hls:2.X.X'


SimpleExoPlayer player = new SimpleExoPlayer.Builder(context).build();


// Set the media item to the Cloudflare Stream HLS Manifest URL:
player.setMediaItem(MediaItem.fromUri("https://customer-9cbb9x7nxdw5hb57.cloudflarestream.com/8f92fe7d2c1c0983767649e065e691fc/manifest/video.m3u8"));


player.prepare();
```

</page>

<page>
---
title: iOS · Cloudflare Stream docs
description: You can stream both on-demand and live video to native iOS, tvOS
  and macOS apps using AVPlayer.
lastUpdated: 2025-08-20T20:59:04.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/ios/index.md
---

You can stream both on-demand and live video to native iOS, tvOS and macOS apps using [AVPlayer](https://developer.apple.com/documentation/avfoundation/avplayer).

Note

Before you can play videos, you must first [upload a video to Cloudflare Stream](https://developers.cloudflare.com/stream/uploading-videos/) or be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live)

## Example Apps

* [iOS](https://developers.cloudflare.com/stream/examples/ios/)

## Using AVPlayer

Play a video from Cloudflare Stream using AVPlayer:

```swift
import SwiftUI
import AVKit


struct MyView: View {
    // Change the url to the Cloudflare Stream HLS manifest URL
    private let player = AVPlayer(url: URL(string: "https://customer-9cbb9x7nxdw5hb57.cloudflarestream.com/8f92fe7d2c1c0983767649e065e691fc/manifest/video.m3u8")!)


    var body: some View {
        VideoPlayer(player: player)
            .onAppear() {
                player.play()
            }
    }
}


struct MyView_Previews: PreviewProvider {
    static var previews: some View {
        MyView()
    }
}
```

</page>

<page>
---
title: Web · Cloudflare Stream docs
description: Cloudflare Stream works with all web video players that support HLS and DASH.
lastUpdated: 2025-08-20T20:59:04.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/web/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-own-player/web/index.md
---

Cloudflare Stream works with all web video players that support HLS and DASH.

Note

Before you can play videos, you must first [upload a video to Cloudflare Stream](https://developers.cloudflare.com/stream/uploading-videos/) or be [actively streaming to a live input](https://developers.cloudflare.com/stream/stream-live)

## Examples

* [Video.js](https://developers.cloudflare.com/stream/examples/video-js/)
* [HLS reference player (hls.js)](https://developers.cloudflare.com/stream/examples/hls-js/)
* [DASH reference player (dash.js)](https://developers.cloudflare.com/stream/examples/dash-js/)
* [Vidstack](https://developers.cloudflare.com/stream/examples/vidstack/)

</page>

<page>
---
title: Stream Player API · Cloudflare Stream docs
description: For further control and customization, we provide an additional
  JavaScript SDK that you can use to control video playback and listen for media
  events.
lastUpdated: 2024-09-25T18:55:39.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/
  md: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/index.md
---

For further control and customization, we provide an additional JavaScript SDK that you can use to control video playback and listen for media events.

To use this SDK, add an additional `<script>` tag to your website:

```html
<!-- You can use styles and CSS on this iframe element where the video player will appear -->
<iframe
  src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
  style="border: none"
  height="720"
  width="1280"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
  id="stream-player"
></iframe>


<script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>


<!-- Your JavaScript code below-->
<script>
  const player = Stream(document.getElementById('stream-player'));
  player.addEventListener('play', () => {
    console.log('playing!');
  });
  player.play().catch(() => {
    console.log('playback failed, muting to try again');
    player.muted = true;
    player.play();
  });
</script>
```

## Methods

* `play()` Promise

  * Start video playback.

* `pause()` null

  * Pause video playback.

## Properties

* `autoplay` boolean

  * Sets or returns whether the autoplay attribute was set, allowing video playback to start upon load.

Note

Some browsers prevent videos with audio from playing automatically. You may add the `mute` attribute to allow your videos to autoplay. For more information, review the [iOS video policies](https://webkit.org/blog/6784/new-video-policies-for-ios/).

* `buffered` TimeRanges readonly

  * An object conforming to the TimeRanges interface. This object is normalized, which means that ranges are ordered, don't overlap, aren't empty, and don't touch (adjacent ranges are folded into one bigger range).

* `controls` boolean

  * Sets or returns whether the video should display controls (like play/pause etc.)

* `currentTime` integer

  * Returns the current playback time in seconds. Setting this value seeks the video to a new time.

* `defaultTextTrack`

  * Will initialize the player with the specified language code's text track enabled. The value should be the BCP-47 language code that was used to [upload the text track](https://developers.cloudflare.com/stream/edit-videos/adding-captions/). If the specified language code has no captions available, the player will behave as though no language code had been provided.

Note

This will *only* work once during initialization. Beyond that point the user has full control over their text track settings.

* `duration` integer readonly

  * Returns the duration of the video in seconds.

* `ended` boolean readonly

  * Returns whether the video has ended.

* `letterboxColor` string

  * Any valid [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) provided will be applied to the letterboxing/pillarboxing of the player's UI. This can be set to `transparent` to avoid letterboxing/pillarboxing when not in fullscreen mode.

* `loop` boolean

  * Sets or returns whether the video should start over when it reaches the end

* `muted` boolean

  * Sets or returns whether the audio should be played with the video

* `paused` boolean readonly

  * Returns whether the video is paused

* `played` TimeRanges readonly

  * An object conforming to the TimeRanges interface. This object is normalized, which means that ranges are ordered, don't overlap, aren't empty, and don't touch (adjacent ranges are folded into one bigger range).

* `preload` boolean

  * Sets or returns whether the video should be preloaded upon element load.

Note

The `<video>` element does not force the browser to follow the value of this attribute; it is a mere hint. Even though the `preload="none"` option is a valid HTML5 attribute, Stream player will always load some metadata to initialize the player. The amount of data loaded in this case is negligible.

* `primaryColor` string

  * Any valid [CSS color value](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) provided will be applied to certain elements of the player's UI.

* `volume` float

  * Sets or returns volume from 0.0 (silent) to 1.0 (maximum value)

## Events

### Standard Video Element Events

We support most of the [standardized media element events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events).

* `abort`

  * Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.

* `canplay`

  * Sent when enough data is available that the media can be played, at least for a couple of frames.

* `canplaythrough`

  * Sent when the entire media can be played without interruption, assuming the download rate remains at least at the current level. It will also be fired when playback is toggled between paused and playing. Note: Manually setting the currentTime will eventually fire a canplaythrough event in firefox. Other browsers might not fire this event.

* `durationchange`

  * The metadata has loaded or changed, indicating a change in duration of the media. This is sent, for example, when the media has loaded enough that the duration is known.

* `ended`

  * Sent when playback completes.

* `error`

  * Sent when an error occurs. (e.g. the video has not finished encoding yet, or the video fails to load due to an incorrect signed URL)

* `loadeddata`

  * The first frame of the media has finished loading.

* `loadedmetadata`

  * The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.

* `loadstart`

  * Sent when loading of the media begins.

* `pause`

  * Sent when the playback state is changed to paused (paused property is true).

* `play`

  * Sent when the playback state is no longer paused, as a result of the play method, or the autoplay attribute.

* `playing`

  * Sent when the media has enough data to start playing, after the play event, but also when recovering from being stalled, when looping media restarts, and after seeked, if it was playing before seeking.

* `progress`

  * Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.

* `ratechange`

  * Sent when the playback speed changes.

* `seeked`

  * Sent when a seek operation completes.

* `seeking`

  * Sent when a seek operation begins.

* `stalled`

  * Sent when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming.

* `suspend`

  * Sent when loading of the media is suspended; this may happen either because the download has completed or because it has been paused for any other reason.

* `timeupdate`

  * The time indicated by the element's currentTime attribute has changed.

* `volumechange`

  * Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).

* `waiting`

  * Sent when the requested operation (such as playback) is delayed pending the completion of another operation (such as a seek).

### Non-standard Events

Non-standard events are prefixed with `stream-` to distinguish them from standard events.

* `stream-adstart`

  * Fires when `ad-url` attribute is present and the ad begins playback

* `stream-adend`

  * Fires when `ad-url` attribute is present and the ad finishes playback

* `stream-adtimeout`

  * Fires when `ad-url` attribute is present and the ad took too long to load.

</page>
