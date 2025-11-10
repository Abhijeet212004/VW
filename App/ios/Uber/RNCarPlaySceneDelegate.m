//
//  RNCarPlaySceneDelegate.m
//  ParkEasy
//

#import "RNCarPlaySceneDelegate.h"
#import <CarPlay/CarPlay.h>

@interface RNCarPlaySceneDelegate()
@property (nonatomic, strong) CPInterfaceController *interfaceController;
@property (nonatomic, strong) CPWindow *window;
@end

@implementation RNCarPlaySceneDelegate

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene
           didConnectInterfaceController:(CPInterfaceController *)interfaceController
                                toWindow:(CPWindow *)window {
    self.interfaceController = interfaceController;
    self.window = window;
    
    NSLog(@"🚗 CarPlay connected!");
    
    // Create a basic map template for parking
    CPMapTemplate *mapTemplate = [[CPMapTemplate alloc] init];
    mapTemplate.mapDelegate = self;
    
    // Add navigation bar buttons
    CPBarButton *searchButton = [[CPBarButton alloc] initWithTitle:@"Find Parking" 
                                                            handler:^(CPBarButton * _Nonnull barButton) {
        NSLog(@"🔍 Find Parking button pressed");
        [self showParkingOptions];
    }];
    
    CPBarButton *profileButton = [[CPBarButton alloc] initWithTitle:@"Profile" 
                                                             handler:^(CPBarButton * _Nonnull barButton) {
        NSLog(@"👤 Profile button pressed");
        [self showProfile];
    }];
    
    mapTemplate.leadingNavigationBarButtons = @[searchButton];
    mapTemplate.trailingNavigationBarButtons = @[profileButton];
    
    // Set the map template as root
    [self.interfaceController setRootTemplate:mapTemplate animated:YES completion:nil];
}

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene
        didDisconnectInterfaceController:(CPInterfaceController *)interfaceController
                              fromWindow:(CPWindow *)window {
    self.interfaceController = nil;
    self.window = nil;
    NSLog(@"📱 CarPlay disconnected");
}

- (void)showParkingOptions {
    // Create parking search options
    CPListItem *nearbyItem = [[CPListItem alloc] initWithText:@"Nearby Parking" 
                                                   detailText:@"Find spots near your location" 
                                                        image:nil 
                                                accessoryImage:nil 
                                                   accessoryType:CPListItemAccessoryTypeDisclosureIndicator];
    
    CPListItem *cheapItem = [[CPListItem alloc] initWithText:@"Cheap Parking" 
                                                  detailText:@"Budget-friendly options" 
                                                       image:nil 
                                               accessoryImage:nil 
                                                  accessoryType:CPListItemAccessoryTypeDisclosureIndicator];
    
    CPListItem *quickItem = [[CPListItem alloc] initWithText:@"Quick Access" 
                                                  detailText:@"Fast entry/exit spots" 
                                                       image:nil 
                                               accessoryImage:nil 
                                                  accessoryType:CPListItemAccessoryTypeDisclosureIndicator];
    
    CPListSection *section = [[CPListSection alloc] initWithItems:@[nearbyItem, cheapItem, quickItem]];
    CPListTemplate *listTemplate = [[CPListTemplate alloc] initWithTitle:@"Find Parking" 
                                                                 sections:@[section]];
    
    [self.interfaceController pushTemplate:listTemplate animated:YES completion:nil];
}

- (void)showProfile {
    // Create profile options
    CPListItem *bookingsItem = [[CPListItem alloc] initWithText:@"My Bookings" 
                                                     detailText:@"View current reservations" 
                                                          image:nil 
                                                 accessoryImage:nil 
                                                    accessoryType:CPListItemAccessoryTypeDisclosureIndicator];
    
    CPListItem *paymentItem = [[CPListItem alloc] initWithText:@"Payment Methods" 
                                                    detailText:@"Manage payment options" 
                                                         image:nil 
                                                accessoryImage:nil 
                                                   accessoryType:CPListItemAccessoryTypeDisclosureIndicator];
    
    CPListSection *section = [[CPListSection alloc] initWithItems:@[bookingsItem, paymentItem]];
    CPListTemplate *listTemplate = [[CPListTemplate alloc] initWithTitle:@"Profile" 
                                                                 sections:@[section]];
    
    [self.interfaceController pushTemplate:listTemplate animated:YES completion:nil];
}

@end