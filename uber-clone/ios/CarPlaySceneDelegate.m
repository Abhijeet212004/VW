#import "CarPlaySceneDelegate.h"

@implementation CarPlaySceneDelegate

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene 
            didConnectInterfaceController:(CPInterfaceController *)interfaceController {
    
    self.interfaceController = interfaceController;
    
    NSLog(@"🚗 CarPlay connected successfully!");
    
    // Create CarPlay interface
    [self setupCarPlayInterface];
}

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene 
        didDisconnectInterfaceController:(CPInterfaceController *)interfaceController {
    
    self.interfaceController = nil;
    NSLog(@"📱 CarPlay disconnected");
}

- (void)setupCarPlayInterface {
    // Create parking-related list items
    CPListItem *findParkingItem = [[CPListItem alloc] 
        initWithText:@"Find Parking" 
        detailText:@"Locate nearby parking spots"
        image:[UIImage systemImageNamed:@"parkingsign.circle"]];
    
    CPListItem *myBookingsItem = [[CPListItem alloc] 
        initWithText:@"My Bookings" 
        detailText:@"View current reservations"
        image:[UIImage systemImageNamed:@"calendar.circle"]];
    
    CPListItem *myVehiclesItem = [[CPListItem alloc] 
        initWithText:@"My Vehicles" 
        detailText:@"Manage registered vehicles"
        image:[UIImage systemImageNamed:@"car.circle"]];
    
    // Create list section
    CPListSection *mainSection = [[CPListSection alloc] initWithItems:@[
        findParkingItem,
        myBookingsItem,
        myVehiclesItem
    ]];
    
    // Create list template
    CPListTemplate *listTemplate = [[CPListTemplate alloc] 
        initWithTitle:@"TechWagon Parking" 
        sections:@[mainSection]];
    
    // Set up item handlers (optional for now)
    findParkingItem.handler = ^(id<CPSelectableListItem> item, dispatch_block_t completionBlock) {
        NSLog(@"🅿️ Find Parking selected");
        completionBlock();
    };
    
    myBookingsItem.handler = ^(id<CPSelectableListItem> item, dispatch_block_t completionBlock) {
        NSLog(@"📋 My Bookings selected");
        completionBlock();
    };
    
    myVehiclesItem.handler = ^(id<CPSelectableListItem> item, dispatch_block_t completionBlock) {
        NSLog(@"🚗 My Vehicles selected");
        completionBlock();
    };
    
    // Set as root template
    [self.interfaceController setRootTemplate:listTemplate animated:YES completion:^(BOOL success, NSError * _Nullable error) {
        if (success) {
            NSLog(@"✅ CarPlay interface set up successfully");
        } else {
            NSLog(@"❌ Failed to set up CarPlay interface: %@", error.localizedDescription);
        }
    }];
}

@end