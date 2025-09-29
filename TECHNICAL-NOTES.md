# 🔧 Technical Notes & Known Issues

## 📍 Google Maps API Deprecation Warnings

**Status**: ⚠️ Non-critical warnings (functionality not affected)

Google Maps is showing deprecation warnings for:
- `google.maps.places.AutocompleteService` → migrate to `google.maps.places.AutocompleteSuggestion`
- `google.maps.places.PlacesService` → migrate to `google.maps.places.Place`

**Timeline**: 
- Current APIs will work until at least **March 1st, 2026** (12+ months notice required)
- Migration recommended but not urgent
- Bug fixes still provided for current APIs

**Action Required**: 
- Monitor for migration guides from Google
- Plan migration in 2025 before March 1st, 2026 deadline
- Current implementation works perfectly and is stable

---

## 💳 Stripe Console Messages

**Status**: ✅ Normal behavior (no action needed)

Console shows Stripe-related messages:
```
Error: A listener indicated an asynchronous response by returning true, 
but the message channel closed before a response was received
```

**Explanation**:
- These are normal Stripe iframe communication messages
- Related to Stripe's internal browser extension detection
- Do not affect payment functionality
- Common in all Stripe integrations

**Action Required**: None - this is expected behavior

---

## 🚗 Vehicle Passenger Limits

**Status**: ✅ Implemented

Passenger limits now enforced:
- **Sedan**: Maximum 4 passengers
- **SUV**: Maximum 7 passengers  
- **Van**: Maximum 8 passengers

**Features**:
- Dynamic passenger grid based on vehicle selection
- Auto-reset passenger count when switching to smaller vehicle
- Clear capacity indicators in vehicle selection

---

## 📱 Modal Event Handling

**Status**: ✅ Fixed

**Issue Resolved**: 
- Address input modals no longer close when typing
- Added `stopPropagation()` to prevent event bubbling
- Google Places suggestions render above modals (z-index: 100000)

**Implementation**:
- Modal content areas prevent event propagation
- Button interactions isolated from backdrop clicks
- Proper z-index hierarchy maintained

---

## 🎯 Performance Optimizations

**Current State**: ✅ Production Ready

- **React Portals**: Efficient modal rendering
- **useCallback**: Optimized re-renders for price calculations
- **SSR Safety**: Client-side mounting for portals
- **Event Debouncing**: Google Places API calls optimized
- **Code Splitting**: Lazy-loaded components where beneficial

---

## 🔮 Future Improvements

### Short Term (1-3 months):
- [ ] Google Maps API migration planning
- [ ] Enhanced error boundaries for payment flows
- [ ] Performance monitoring integration

### Long Term (3-6 months):
- [ ] Google Maps Places API v2 migration
- [ ] Advanced payment features (saved cards, etc.)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

*Last Updated: January 2025*
*Status: All critical functionality working perfectly* ✅
