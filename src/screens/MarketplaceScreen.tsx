import { useRef, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { shadows } from '../theme/shadows';
import { PressableScale } from '../components/PressableScale';
import { useCart, CartProduct } from '../context/CartContext';
import { shopProducts, customerReviews, ShopProduct } from '../data/shopData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Brand Colors ──────────────────────────────────────────────────
const BRAND = {
  gold: '#FDB913',
  goldDark: '#E5A710',
  dark: '#1B1B1B',
  darkBg: '#2C2C2C',
  headerBg: '#1E6AE1',
  lightGray: '#F5F5F5',
  border: '#E5E5E5',
  starColor: '#FDB913',
  white: '#FFFFFF',
  black: '#000000',
};

// ── Navigation Types ──────────────────────────────────────────────
type MarketplaceStackParamList = {
  Collection: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
};

type CollectionProps = NativeStackScreenProps<MarketplaceStackParamList, 'Collection'>;
type DetailProps = NativeStackScreenProps<MarketplaceStackParamList, 'ProductDetails'>;
type CartProps = NativeStackScreenProps<MarketplaceStackParamList, 'Cart'>;
type CheckoutProps = NativeStackScreenProps<MarketplaceStackParamList, 'Checkout'>;

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

// ══════════════════════════════════════════════════════════════════
// ROOT MARKETPLACE
// ══════════════════════════════════════════════════════════════════
export function MarketplaceScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

// ══════════════════════════════════════════════════════════════════
// MENU ITEMS
// ══════════════════════════════════════════════════════════════════
const MENU_ITEMS: { id: string; label: string; icon: keyof typeof Feather.glyphMap; color: string; bgColor: string; desc: string }[] = [
  { id: 'contact', label: 'Contact Us', icon: 'phone', color: '#1E6AE1', bgColor: '#E8F0FD', desc: 'Get in touch with our support team' },
  { id: 'faq', label: 'FAQ', icon: 'help-circle', color: '#F97316', bgColor: '#FFF7ED', desc: 'Frequently asked questions' },
  { id: 'location', label: 'Our Location', icon: 'map-pin', color: '#22C55E', bgColor: '#F0FDF4', desc: 'Find our stores near you' },
];

// ══════════════════════════════════════════════════════════════════
// SHARED HEADER – "NEEM Shop"
// ══════════════════════════════════════════════════════════════════
function ShopHeader({
  onBack,
  onCartPress,
  showSearch = true,
}: {
  onBack?: () => void;
  onCartPress?: () => void;
  showSearch?: boolean;
}) {
  const { cartCount } = useCart();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setMenuVisible(false));
  };

  const handleMenuItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu();
    // Placeholder actions
    // In a real app these would navigate to actual screens
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <PressableScale onPress={openMenu} style={styles.headerIconBtn}>
          <Feather name="menu" size={22} color={BRAND.dark} />
        </PressableScale>

        {/* NEEM Shop logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>NEEM</Text>
          </View>
          <Text style={styles.logoText}>Shop</Text>
        </View>

        <View style={styles.headerRight}>
          {showSearch && (
            <PressableScale style={styles.headerIconBtn}>
              <Feather name="search" size={20} color={BRAND.dark} />
            </PressableScale>
          )}
          <PressableScale style={styles.headerIconBtn} onPress={onCartPress}>
            <Feather name="shopping-cart" size={20} color={BRAND.dark} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </PressableScale>
        </View>
      </View>

      {/* ─── Hamburger Menu Modal ─────────────────── */}
      {menuVisible && (
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
          statusBarTranslucent
        >
          <Animated.View style={[styles.menuBackdrop, { opacity: backdropAnim }]}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeMenu} />
          </Animated.View>

          <Animated.View
            style={[
              styles.menuDrawer,
              { paddingTop: insets.top + 12, transform: [{ translateX: slideAnim }] },
            ]}
          >
            {/* Drawer header */}
            <LinearGradient
              colors={['#1E6AE1', '#1756B8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuDrawerHeader}
            >
              <View style={styles.menuLogoRow}>
                <View style={styles.menuLogoBadge}>
                  <Text style={styles.menuLogoBadgeText}>NEEM</Text>
                </View>
                <Text style={styles.menuLogoShop}>Shop</Text>
              </View>
              <Text style={styles.menuDrawerTagline}>Your wellness marketplace</Text>
            </LinearGradient>

            {/* Menu items */}
            <View style={styles.menuItems}>
              {MENU_ITEMS.map((item) => (
                <PressableScale
                  key={item.id}
                  style={styles.menuItemRow}
                  onPress={() => handleMenuItem(item.id)}
                >
                  <View style={[styles.menuItemIcon, { backgroundColor: item.bgColor }]}>
                    <Feather name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                    <Text style={styles.menuItemDesc}>{item.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#8E99A4" />
                </PressableScale>
              ))}
            </View>

            {/* Close button */}
            <PressableScale style={styles.menuCloseBtn} onPress={closeMenu}>
              <Feather name="x" size={18} color={colors.textSecondary} />
              <Text style={styles.menuCloseBtnText}>Close</Text>
            </PressableScale>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// STARS COMPONENT
// ══════════════════════════════════════════════════════════════════
function Stars({ rating, size = 16, color = BRAND.starColor }: { rating: number; size?: number; color?: string }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.25;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Feather key={`f${i}`} name="star" size={size} color={color} />
      ))}
      {hasHalf && <Feather name="star" size={size} color={color} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Feather key={`e${i}`} name="star" size={size} color="#D1D5DB" />
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 1. COLLECTION SCREEN
// ══════════════════════════════════════════════════════════════════
function CollectionScreen({ navigation }: CollectionProps) {
  const { addItem } = useCart();

  const toCartProduct = (p: ShopProduct): CartProduct => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceFormatted: p.priceFormatted,
    image: p.images[0],
  });

  return (
    <View style={styles.screenRoot}>
      <ShopHeader onCartPress={() => navigation.navigate('Cart')} />
      <ScrollView
        contentContainerStyle={styles.collectionContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionTitle}>All collections</Text>
          <Text style={styles.collectionSubtitle}>Collections designed for your wellness.</Text>
        </View>

        <View style={styles.productGrid}>
          {shopProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <PressableScale
                style={styles.productCardPressable}
                onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
              >
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: product.images[0] }} style={styles.productImage} />
                </View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>{product.priceFormatted}</Text>
              </PressableScale>
              <PressableScale
                style={styles.addToCartBtn}
                onPress={() => addItem(toCartProduct(product))}
              >
                <Text style={styles.addToCartText}>ADD TO CART</Text>
              </PressableScale>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. PRODUCT DETAIL SCREEN
// ══════════════════════════════════════════════════════════════════
function ProductDetailScreen({ route, navigation }: DetailProps) {
  const product = shopProducts.find((p) => p.id === route.params.productId) ?? shopProducts[0];
  const { addItem } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openSection, setOpenSection] = useState('benefits');
  const [currentReview, setCurrentReview] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const toCartProduct = (p: ShopProduct): CartProduct => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceFormatted: p.priceFormatted,
    image: p.images[0],
  });

  const accordionSections = useMemo(
    () => [
      {
        id: 'description',
        title: 'DESCRIPTION',
        content: product.description,
        isBullet: false,
      },
      {
        id: 'benefits',
        title: 'BENEFITS',
        content: product.benefits,
        isBullet: true,
      },
      {
        id: 'ingredients',
        title: 'INGREDIENTS',
        content: product.ingredients,
        isBullet: false,
      },
      {
        id: 'directions',
        title: 'DIRECTIONS',
        content: product.directions,
        isBullet: false,
      },
      {
        id: 'warning',
        title: 'WARNING',
        content: product.warning,
        isBullet: false,
      },
    ],
    [product]
  );

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const handleImageScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
    setActiveImageIndex(index);
  };

  const selectThumbnail = (index: number) => {
    setActiveImageIndex(index);
    scrollRef.current?.scrollTo({ x: index * (SCREEN_WIDTH - 40), animated: true });
  };

  const nextReview = () => setCurrentReview((prev) => (prev + 1) % customerReviews.length);
  const prevReview = () =>
    setCurrentReview((prev) => (prev - 1 + customerReviews.length) % customerReviews.length);

  // Delivery estimate date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 8);
  const deliveryStr = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.screenRoot}>
      <ShopHeader
        onBack={() => navigation.goBack()}
        onCartPress={() => navigation.navigate('Cart')}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Image Gallery ─────────────────── */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleImageScroll}
          scrollEventThrottle={16}
          style={styles.imageGallery}
        >
          {product.images.map((uri, i) => (
            <View key={i} style={styles.gallerySlide}>
              <Image source={{ uri }} style={styles.galleryImage} />
              <View style={styles.zoomIcon}>
                <Feather name="search" size={14} color={BRAND.dark} />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Thumbnails ────────────────────── */}
        <View style={styles.thumbnailRow}>
          {product.images.map((uri, i) => (
            <PressableScale
              key={i}
              onPress={() => selectThumbnail(i)}
              style={[
                styles.thumbnail,
                activeImageIndex === i && styles.thumbnailActive,
              ]}
            >
              <Image source={{ uri }} style={styles.thumbnailImage} />
            </PressableScale>
          ))}
        </View>

        {/* ── Rating ────────────────────────── */}
        <View style={styles.ratingRow}>
          <Stars rating={product.rating} size={18} />
          <Text style={styles.ratingText}>
            {product.rating}/5 ({product.reviewCount.toLocaleString()} reviews)
          </Text>
        </View>

        {/* ── Name & Price ──────────────────── */}
        <View style={styles.detailInfo}>
          <Text style={styles.detailName}>{product.name}</Text>
          <Text style={styles.detailPrice}>{product.priceFormatted}</Text>
        </View>

        {/* ── Add to Cart Button ────────────── */}
        <PressableScale
          style={styles.detailAddBtn}
          onPress={() => addItem(toCartProduct(product))}
        >
          <Text style={styles.detailAddBtnText}>ADD TO CART</Text>
        </PressableScale>

        {/* ── Delivery Estimate ─────────────── */}
        <View style={styles.deliveryRow}>
          <Feather name="package" size={20} color={BRAND.dark} />
          <Text style={styles.deliveryText}>
            Order now to get it by <Text style={styles.deliveryBold}>{deliveryStr}</Text>
          </Text>
        </View>

        {/* ── Accordion Sections ────────────── */}
        <View style={styles.accordionWrap}>
          {accordionSections.map((section, index) => {
            const isOpen = openSection === section.id;
            return (
              <View key={section.id}>
                <View style={styles.accordionDivider} />
                <PressableScale
                  onPress={() => handleToggle(section.id)}
                  style={styles.accordionHeader}
                >
                  <Text style={styles.accordionTitle}>{section.title}</Text>
                  <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={BRAND.dark}
                  />
                </PressableScale>
                {isOpen && (
                  <View style={styles.accordionBody}>
                    {section.isBullet && Array.isArray(section.content) ? (
                      (section.content as string[]).map((item, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{item}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.accordionBodyText}>{section.content as string}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          <View style={styles.accordionDivider} />
        </View>

        {/* ── Badges Footer ─────────────────── */}
        <View style={styles.badgeSection}>
          {product.badges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View style={styles.badgeCircle}>
                {badge.type === 'gf' ? (
                  <Text style={styles.badgeGFText}>GF</Text>
                ) : (
                  <Feather
                    name={badge.type === 'vegan' ? 'feather' : 'award'}
                    size={22}
                    color={BRAND.dark}
                  />
                )}
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Customer Reviews Section ───────── */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Success Stories of our{'\n'}Customers</Text>
          <View style={styles.reviewOverallRow}>
            <Stars rating={4.5} size={18} color={BRAND.starColor} />
            <Text style={styles.reviewOverallText}>4.5/5 ({product.reviewCount.toLocaleString()} reviews)</Text>
          </View>

          {/* Review Card */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewHeading}>{customerReviews[currentReview].heading}</Text>
            <Stars rating={customerReviews[currentReview].rating} size={16} />
            <Text style={styles.reviewText}>{customerReviews[currentReview].text}</Text>
            <Text style={styles.reviewAuthor}>
              {customerReviews[currentReview].name}, {customerReviews[currentReview].location}
            </Text>
          </View>

          {/* Navigation Arrows */}
          <View style={styles.reviewNav}>
            <PressableScale style={styles.reviewNavBtn} onPress={prevReview}>
              <Feather name="chevron-left" size={22} color={BRAND.dark} />
            </PressableScale>
            <PressableScale style={styles.reviewNavBtn} onPress={nextReview}>
              <Feather name="chevron-right" size={22} color={BRAND.dark} />
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. CART SCREEN
// ══════════════════════════════════════════════════════════════════
function CartScreen({ navigation }: CartProps) {
  const { items, cartTotalFormatted, updateQuantity, removeItem, cartCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screenRoot}>
      {/* Header */}
      <View style={[styles.cartHeader, { paddingTop: insets.top + 8 }]}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Feather name="arrow-left" size={22} color={BRAND.dark} />
        </PressableScale>
        <Text style={styles.cartHeaderTitle}>Your Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Feather name="shopping-bag" size={64} color={BRAND.border} />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Browse our wellness products and add items</Text>
          <PressableScale style={styles.shopNowBtn} onPress={() => navigation.navigate('Collection')}>
            <Text style={styles.shopNowText}>SHOP NOW</Text>
          </PressableScale>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.cartList} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.cartItem}>
                <Image source={{ uri: item.product.image }} style={styles.cartItemImage} />
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>{item.product.priceFormatted}</Text>
                  <View style={styles.quantityRow}>
                    <PressableScale
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Feather name="minus" size={16} color={BRAND.dark} />
                    </PressableScale>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <PressableScale
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Feather name="plus" size={16} color={BRAND.dark} />
                    </PressableScale>
                  </View>
                </View>
                <PressableScale onPress={() => removeItem(item.product.id)} style={styles.removeBtn}>
                  <Feather name="trash-2" size={18} color="#E74C3C" />
                </PressableScale>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.cartFooter, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Total ({cartCount} items)</Text>
              <Text style={styles.cartTotalValue}>{cartTotalFormatted}</Text>
            </View>
            <PressableScale
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>
            </PressableScale>
          </View>
        </>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. CHECKOUT SCREEN
// ══════════════════════════════════════════════════════════════════
function CheckoutScreen({ navigation }: CheckoutProps) {
  const { cartTotalFormatted } = useCart();
  const insets = useSafeAreaInsets();
  const [orderExpanded, setOrderExpanded] = useState(false);
  const [emailNews, setEmailNews] = useState(false);
  const [saveInfo, setSaveInfo] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.screenRoot}>
      {/* Checkout Header */}
      <View style={[styles.checkoutHeader, { paddingTop: insets.top + 8 }]}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Feather name="arrow-left" size={22} color={BRAND.dark} />
        </PressableScale>
        <View style={styles.logoWrap}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>NEEM</Text>
          </View>
          <Text style={styles.logoText}>Shop</Text>
        </View>
        <PressableScale style={styles.headerIconBtn}>
          <Feather name="shopping-bag" size={20} color={BRAND.dark} />
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={styles.checkoutContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <PressableScale
          style={styles.orderSummaryRow}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOrderExpanded(!orderExpanded);
          }}
        >
          <View style={styles.orderSummaryLeft}>
            <Text style={styles.orderSummaryLabel}>Order summary</Text>
            <Feather name={orderExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
          </View>
          <Text style={styles.orderSummaryTotal}>{cartTotalFormatted}</Text>
        </PressableScale>

        {orderExpanded && (
          <View style={styles.orderSummaryDetail}>
            <View style={styles.orderLine}>
              <Text style={styles.orderLineLabel}>Subtotal</Text>
              <Text style={styles.orderLineValue}>{cartTotalFormatted}</Text>
            </View>
            <View style={styles.orderLine}>
              <Text style={styles.orderLineLabel}>Shipping</Text>
              <Text style={styles.orderLineValue}>Calculated at checkout</Text>
            </View>
          </View>
        )}

        {/* Contact Section */}
        <View style={styles.checkoutSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.checkoutSectionTitle}>Contact</Text>
            <PressableScale>
              <Text style={styles.signInLink}>Sign in</Text>
            </PressableScale>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email or mobile phone number"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PressableScale
            style={styles.checkboxRow}
            onPress={() => setEmailNews(!emailNews)}
          >
            <View style={[styles.checkbox, emailNews && styles.checkboxChecked]}>
              {emailNews && <Feather name="check" size={14} color={BRAND.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Email me with news and offers</Text>
          </PressableScale>
        </View>

        {/* Delivery Section */}
        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutSectionTitle}>Delivery</Text>

          {/* Country */}
          <View style={styles.selectInput}>
            <Text style={styles.selectLabel}>Country/Region</Text>
            <Text style={styles.selectValue}>United States</Text>
            <Feather name="chevron-down" size={18} color="#999" style={styles.selectIcon} />
          </View>

          {/* Name Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="First name (optional)"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Last name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Address */}
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.input, { flex: 1, paddingRight: 40 }]}
              placeholder="Address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
            />
            <Feather name="search" size={18} color="#999" style={styles.inputIcon} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Apartment, suite, etc. (optional)"
            placeholderTextColor="#999"
            value={apartment}
            onChangeText={setApartment}
          />

          {/* City / State / ZIP Row */}
          <View style={styles.inputRow3}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="City"
              placeholderTextColor="#999"
              value={city}
              onChangeText={setCity}
            />
            <View style={[styles.selectInput, { flex: 2 }]}>
              <Text style={styles.selectLabel}>State</Text>
              <Feather name="chevron-down" size={16} color="#999" style={styles.selectIcon} />
            </View>
            <TextInput
              style={[styles.input, { flex: 1.5 }]}
              placeholder="ZIP code"
              placeholderTextColor="#999"
              value={zip}
              onChangeText={setZip}
              keyboardType="numeric"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputWithIcon}>
            <TextInput
              style={[styles.input, { flex: 1, paddingRight: 40 }]}
              placeholder="Phone"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Feather name="info" size={18} color="#999" style={styles.inputIcon} />
          </View>

          <PressableScale
            style={styles.checkboxRow}
            onPress={() => setSaveInfo(!saveInfo)}
          >
            <View style={[styles.checkbox, saveInfo && styles.checkboxChecked]}>
              {saveInfo && <Feather name="check" size={14} color={BRAND.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Save this information for next time</Text>
          </PressableScale>
        </View>

        {/* Shipping Method */}
        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutSectionTitle}>Shipping method</Text>
          <View style={styles.shippingNotice}>
            <Text style={styles.shippingNoticeText}>
              Enter your shipping address to view available shipping methods.
            </Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: BRAND.white,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    backgroundColor: BRAND.white,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    backgroundColor: BRAND.headerBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  logoBadgeText: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.white,
    letterSpacing: 1,
  },
  logoText: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: BRAND.dark,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: BRAND.gold,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontFamily: typography.heading,
    fontSize: 9,
    color: BRAND.dark,
  },

  // ── Collection Screen ────────────────────────────────────
  collectionContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  collectionHeader: {
    marginBottom: 24,
  },
  collectionTitle: {
    fontFamily: typography.heading,
    fontSize: 28,
    color: BRAND.black,
    marginBottom: 6,
  },
  collectionSubtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    color: '#666',
  },
  productGrid: {
    gap: 24,
  },
  productCard: {
    backgroundColor: BRAND.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productCardPressable: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  productImageWrap: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: BRAND.lightGray,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  productName: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: BRAND.black,
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: typography.body,
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  addToCartBtn: {
    backgroundColor: BRAND.gold,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
  },
  addToCartText: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.dark,
    letterSpacing: 1.5,
  },

  // ── Product Detail ───────────────────────────────────────
  imageGallery: {
    height: 340,
  },
  gallerySlide: {
    width: SCREEN_WIDTH,
    height: 340,
    backgroundColor: BRAND.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  zoomIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  thumbnail: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: BRAND.lightGray,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: BRAND.dark,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#666',
  },
  detailInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  detailName: {
    fontFamily: typography.heading,
    fontSize: 26,
    color: BRAND.black,
    marginBottom: 4,
  },
  detailPrice: {
    fontFamily: typography.body,
    fontSize: 17,
    color: '#444',
  },
  detailAddBtn: {
    backgroundColor: BRAND.gold,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAddBtnText: {
    fontFamily: typography.heading,
    fontSize: 15,
    color: BRAND.dark,
    letterSpacing: 1.5,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  deliveryText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
  },
  deliveryBold: {
    fontFamily: typography.heading,
    color: BRAND.black,
  },

  // ── Accordion ────────────────────────────────────────────
  accordionWrap: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  accordionDivider: {
    height: 1,
    backgroundColor: BRAND.border,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  accordionTitle: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.black,
    letterSpacing: 0.5,
  },
  accordionBody: {
    paddingBottom: 18,
  },
  accordionBodyText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 8,
    gap: 8,
  },
  bulletDot: {
    fontFamily: typography.body,
    fontSize: 16,
    color: BRAND.black,
    lineHeight: 22,
  },
  bulletText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    flex: 1,
  },

  // ── Badges ───────────────────────────────────────────────
  badgeSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: BRAND.lightGray,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 8,
  },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.white,
  },
  badgeGFText: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.dark,
  },
  badgeLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
  },

  // ── Reviews Section ──────────────────────────────────────
  reviewSection: {
    backgroundColor: BRAND.darkBg,
    marginTop: 24,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  reviewSectionTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: BRAND.white,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  reviewOverallRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  reviewOverallText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  reviewCard: {
    backgroundColor: BRAND.white,
    borderRadius: 16,
    padding: 24,
    gap: 10,
    marginBottom: 20,
  },
  reviewHeading: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: BRAND.black,
  },
  reviewText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  reviewAuthor: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.black,
    marginTop: 4,
  },
  reviewNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  reviewNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  // ── Cart Screen ──────────────────────────────────────────
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  cartHeaderTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: BRAND.dark,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: BRAND.dark,
  },
  emptyCartSubtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  shopNowBtn: {
    backgroundColor: BRAND.gold,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 8,
  },
  shopNowText: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: BRAND.dark,
    letterSpacing: 1.5,
  },
  cartList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: BRAND.white,
    borderRadius: 16,
    padding: 12,
    gap: 14,
    alignItems: 'center',
    ...shadows.soft,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: BRAND.lightGray,
    resizeMode: 'contain',
  },
  cartItemInfo: {
    flex: 1,
    gap: 4,
  },
  cartItemName: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: BRAND.dark,
  },
  cartItemPrice: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#666',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: BRAND.dark,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  cartFooter: {
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
    backgroundColor: BRAND.white,
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTotalLabel: {
    fontFamily: typography.body,
    fontSize: 16,
    color: '#666',
  },
  cartTotalValue: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: BRAND.dark,
  },
  checkoutBtn: {
    backgroundColor: BRAND.dark,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutBtnText: {
    fontFamily: typography.heading,
    fontSize: 15,
    color: BRAND.white,
    letterSpacing: 1.5,
  },

  // ── Checkout Screen ──────────────────────────────────────
  checkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  checkoutContent: {
    paddingBottom: 60,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F0F4FF',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  orderSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderSummaryLabel: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.primary,
  },
  orderSummaryTotal: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: BRAND.dark,
  },
  orderSummaryDetail: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0F4FF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  orderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLineLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#666',
  },
  orderLineValue: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
  },
  checkoutSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutSectionTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: BRAND.dark,
  },
  signInLink: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: typography.body,
    fontSize: 15,
    color: BRAND.dark,
    backgroundColor: BRAND.white,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputRow3: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: BRAND.white,
    justifyContent: 'center',
  },
  selectLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  selectValue: {
    fontFamily: typography.body,
    fontSize: 15,
    color: BRAND.dark,
  },
  selectIcon: {
    position: 'absolute',
    right: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#444',
  },
  shippingNotice: {
    backgroundColor: BRAND.lightGray,
    borderRadius: 10,
    padding: 16,
  },
  shippingNoticeText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // ── Hamburger Menu Drawer ─────────────────────────────────
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 27, 51, 0.5)',
  },
  menuDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E1B33',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  menuDrawerHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 20,
  },
  menuLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  menuLogoBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuLogoBadgeText: {
    fontFamily: typography.heading,
    fontSize: 16,
    color: '#FFFFFF',
  },
  menuLogoShop: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: '#FFFFFF',
  },
  menuDrawerTagline: {
    fontFamily: typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  menuItems: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 6,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
    borderRadius: 16,
    padding: 14,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemLabel: {
    fontFamily: typography.subheading,
    fontSize: 15,
    color: '#0E1B33',
  },
  menuItemDesc: {
    fontFamily: typography.body,
    fontSize: 12,
    color: '#8E99A4',
    marginTop: 2,
  },
  menuCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F4F9',
  },
  menuCloseBtnText: {
    fontFamily: typography.subheading,
    fontSize: 14,
    color: '#56627A',
  },
});
