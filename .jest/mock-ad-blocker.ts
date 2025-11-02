export const adBlocker = () => ({
    ElectronBlocker: {
        fromPrebuiltAdsAndTracking: jest.fn(() => Promise.resolve()),
    },
})
