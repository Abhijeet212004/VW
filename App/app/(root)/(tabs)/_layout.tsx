import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View, Text, StyleSheet } from "react-native";

const TabIcon = 
    ({ source, 
       focused,
       label
    } : 
    {
        source: ImageSourcePropType, 
        focused: boolean;
        label: string;
}) => (
    <View style={styles.tabIconContainer}>
        <Image 
        source={source} 
        tintColor={focused ? "#FFFFFF" : "#8E8E93"}
        resizeMode="contain"
        style={styles.tabIcon}
        />
        <Text style={[styles.tabLabel, { color: focused ? "#FFFFFF" : "#8E8E93" }]}>
            {label}
        </Text>
    </View>
)

const styles = StyleSheet.create({
    tabIconContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
    },
    tabIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
});

const Layout = () => (

    <Tabs 
    initialRouteName="index"
    screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarShowLabel: false,
        tabBarStyle: {
            backgroundColor: "#1C1C1E",
            borderTopWidth: 0,
            height: 80,
            paddingTop: 8,
            paddingBottom: 20,
            position: "absolute",
            // Shadow for iOS
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            // Shadow for Android
            elevation: 10,
        },
    }}
    >
        <Tabs.Screen 
            name="home"
            options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.home} label="Home" />   
            }}
        />
        <Tabs.Screen 
            name="rides"
            options={{
                title: "Services",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.list} label="Services" />   
            }}
        />
        <Tabs.Screen 
            name="chat"
            options={{
                title: "Activity",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.chat} label="Activity" />   
            }}
        />
        <Tabs.Screen 
            name="profile"
            options={{
                title: "Account",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.profile} label="Account" />   
            }}
        />
    </Tabs>

)

export default Layout;