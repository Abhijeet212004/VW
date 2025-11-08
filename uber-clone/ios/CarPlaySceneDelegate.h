#import <CarPlay/CarPlay.h>
#import <UIKit/UIKit.h>

API_AVAILABLE(ios(12.0))
@interface CarPlaySceneDelegate : UIResponder <CPTemplateApplicationSceneDelegate>

@property (strong, nonatomic) CPInterfaceController *interfaceController;

@end