FilePond.registerPlugin(FilePondPluginImagePreview);
FilePond.registerPlugin(FilePondPluginImageResize);
FilePond.registerPlugin(FilePondPluginImageCrop);



FilePond.setOptions({
    labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
    stylePanelAspectRatio: '1:1',
    imageResizeTargetWidth: 50,
    imageResizeTargetHeight: 50,
    imageCropAspectRatio: '1:1',
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleButtonRemoveItemPosition: 'center bottom',
})

console.log(FilePond.FileStatus)

//FilePond.parse(document.body)