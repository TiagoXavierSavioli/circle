import React, {useEffect, useState, useLayoutEffect, useCallback, useRef} from 'react'
import { StyleSheet, FlatList, ScrollView, Dimensions, View, StatusBar, ActivityIndicator, TouchableOpacity} from 'react-native'
import MomentsView from '../../components/Moments/Photo'
import { Text, } from '../../components/Themed'
import AccountView from '../../components/Profile/AccountView'
import ProfileDataComponent from "../../components/Profile/ProfileData"
import {ProfileUserComponentMap, ProfileUserComponent} from "../../components/Profile/ProfileUser"
import ProfileButtonComponent from "../../components/Profile/ProfileButtons"
import { Image } from 'react-native-elements'
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient'
import { useRoute } from '@react-navigation/core'
import PostPreview from '../ViewProfile/PostPreview'
import Colors from '../../constants/Colors'
import useColorScheme from '../../hooks/useColorScheme'
import {ProfileButtonsComponent_dev} from '../../components/Profile/ProfileButtons'
import calcCrow from '../../helpers/distanceCalcule'
import Geolocation from '@react-native-community/geolocation'
import { useDispatch, useSelector } from 'react-redux'
import * as usersActions from '../../store/actions/users'
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

export default function AccountScreen() {
  const route = useRoute()
  const colorScheme = useColorScheme()

  const usernotFiltered = useSelector(state => state.users.user)
  const user = usernotFiltered[0]

  const [error, setError] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [ loading, setLoading ] = useState(true)

  const [currentLatitude, setCurrentLatitude] = useState('')
	const [currentLongitude, setCurrentLongitude] = useState('')

  const [likesNum, setLikesNum] = useState(0)
  const [fansNum, setFansNum] = useState(0)
  const [momentsNum, setMomentsNum] = useState(0) 

  const dispatch = useDispatch()
  const navigation = useNavigation()

  const LoadUser = useCallback(async () => {
    setError(null)
    setRefreshing(true)
    
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          const latitude = JSON.stringify(position.coords.latitude)
          const longitude = JSON.stringify(position.coords.longitude)
          setCurrentLatitude(latitude)
          setCurrentLongitude(longitude)
        }
		  )

      const userData = await AsyncStorage.getItem('userData');
      const transformedData = JSON.parse(userData)
      const { token } = transformedData

      await dispatch(usersActions.getUserById(token))
      await setLikesNum(likesNum)
      await setFansNum(user.fans.length)
      await setMomentsNum(user.moments.length)

    } catch (err) {
        setError(err.message)
    }
    setRefreshing(false)
  }, [dispatch, setLoading, setError])

  useEffect(() => {
    setLoading(true)
    LoadUser()
    .then(() => {
      setLoading(false)
    });

  }, [])

  const navigationImagePicker = () => {
    navigation.navigate('PhotoPickerScreen')
  }

  if(loading || refreshing){
    return (
        <View style={[styles.container,  {alignItems: 'center', justifyContent: 'center', width: WindowWidth, height: WindowHeight}]}>
            <ActivityIndicator color={Colors[colorScheme].tint} size={'large'}/>
        </View>
    );
  }

  if(!loading && user.length === 0){
    return(
        <View style={{alignItems: 'center', justifyContent: 'center', width: WindowWidth, height: WindowHeight}}>
            <Image source={require('../../assets/icons/mood-sad.png')} style={{width: 50, height: 50, tintColor: '#FFF', marginBottom: 10}}/>
            <Text style={{color: '#FFF', textAlign: 'center', fontFamily: 'RedHatDisplay-Medium', fontSize: 12}}>Profile not found,</Text>
            <Text style={{color: '#FFF', textAlign: 'center', fontFamily: 'RedHatDisplay-Medium', fontSize: 12}}>verify your connection to internet</Text>
            <TouchableOpacity style={{marginTop: 30}} onPress={() => LoadUser()}>
                <Text style={{color: Colors[colorScheme].tint, textAlign: 'center', fontFamily: 'RedHatDisplay-Medium', fontSize: 16}}>Reload</Text>
            </TouchableOpacity>
            
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} translucent backgroundColor={'transparent'}/>
        <ScrollView showsVerticalScrollIndicator={false} onScrollToTop={() => LoadUser()}>
          
          <View style={{width: WindowWidth, paddingTop: 100}}>
            <TouchableOpacity onPress={() => navigationImagePicker()}>
                <ProfileUserComponent username={user.username} image={user.picture} imageSize={150}/>
            </TouchableOpacity>
            <View style={styles.numberContainerContainer}>

              <View style={styles.numberContainer}>
                <Text style={styles.number}>{user.fans.length}</Text>
                <Text style={styles.numberLabel}>Fans</Text>
              </View>
              <View style={styles.numberContainer}>
                <Text style={styles.number}>{usernotFiltered[1].length}</Text>
                <Text style={styles.numberLabel}>Moments</Text>
              </View>
              
            </View>    
          </View>


            

            <View style={styles.informationsContainer}>
              {user.description !== null?
                <View style={styles.informationsSubviews}>
                  <Text style={styles.numberLabel}>Biography:</Text>
                  <Text style={styles.informations}>{user.description}</Text>                
                </View>
              :null }
            </View>

            <View style={styles.postsContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.titlePosts}>Moments:</Text>
              </View>

              {usernotFiltered[1] == []?
                null:
                <View style={{alignItems: 'flex-start', marginHorizontal: 10,marginBottom: 10 , overflow: 'hidden', borderRadius: 20}}>
                  <FlatList
                    data={usernotFiltered[1].reverse()}
                    refreshing={refreshing}
                    initialNumToRender={2}
                    removeClippedSubviews={true}
                    onScroll={(event) => {console.log(event.nativeEvent.contentOffset.y)}}
                    renderItem={({item}) => {
                      return(
                        <PostPreview moment={item}/>
                      )
                    }}
                    keyExtractor={(item) => item.id}
                    horizontal={true}
                    showsVerticalScrollIndicator={false}       
                  />  
                </View>
              }
          </View>

        </ScrollView>
          <LinearGradient 
            style={{
              width: WindowWidth,
              height: 100,
              position: 'absolute',
              top: 0,
              zIndex: 1,
            }}
            colors={['#FFF', '#00000000']}
          />        
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  informationsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    width: WindowWidth -20 ,
    borderRadius: 30,
  },
  informationsSubviews: {
    marginBottom: 20,
  },
  informations: {
    fontSize: 14,
    fontFamily: 'RedHatDisplay-Medium',
    color:'#000', 
  },
  postsContainer: {
    marginTop: 0
  },
  titleContainer: {
    paddingLeft: 15,
    width: WindowWidth,
    height: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  titlePosts: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay-Bold',
  },
  numberContainerContainer: {
    marginTop: 30,
    width: WindowWidth,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberContainer: {
    alignItems: 'center',
    width: WindowWidth/2

  },
  number: {
    fontSize: 16,
    fontFamily: 'RedHatDisplay-Bold',
    marginBottom: 2
  },
  numberLabel: {
    fontSize: 12,
    fontFamily: 'RedHatDisplay-Medium',
    marginBottom: 5,
    color:'#8C9BAA',
  }
});