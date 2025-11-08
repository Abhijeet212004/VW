#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface CarPlayBridge : RCTEventEmitter <RCTBridgeModule>

+ (instancetype)sharedInstance;
- (void)sendCarPlayEvent:(NSString *)event data:(NSDictionary *)data;

@end