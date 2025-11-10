#import "CarPlayBridge.h"

@implementation CarPlayBridge {
  BOOL hasListeners;
}

static CarPlayBridge *sharedInstance = nil;

+ (instancetype)sharedInstance {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[self alloc] init];
  });
  return sharedInstance;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"CarPlayAction"];
}

- (void)startObserving {
  hasListeners = YES;
}

- (void)stopObserving {
  hasListeners = NO;
}

- (void)sendCarPlayEvent:(NSString *)event data:(NSDictionary *)data {
  if (hasListeners) {
    [self sendEventWithName:@"CarPlayAction" body:@{
      @"action": event,
      @"data": data ?: @{}
    }];
  }
}

// Export methods that can be called from React Native
RCT_EXPORT_METHOD(updateCarPlayInterface:(NSString *)title items:(NSArray *)items) {
  NSLog(@"📱 Updating CarPlay interface: %@", title);
  // This can be used to update CarPlay from React Native
}

@end