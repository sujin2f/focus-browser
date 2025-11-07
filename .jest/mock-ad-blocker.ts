export const fromPrebuiltAdsAndTracking = jest.fn(() => Promise.resolve())
export const adBlocker = () => ({
    ElectronBlocker: {
        fromPrebuiltAdsAndTracking,
    },
})
