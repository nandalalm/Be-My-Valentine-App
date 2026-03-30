import { useEffect, useRef, useState } from 'react'

const MESSAGE_STEPS = [
  'No',
  'Are you positive? \u{1F914}',
  'Pooki please..\u{1F97A}',
  'If you say no, I will be very sad',
  'I will be very sad..\u{1F972}',
  'Please ???\u{1F495}',
  "Don't do this to me..",
  'Last chance!\u{1F62D}',
]
const MOVE_PHASE_CLICKS = 5
const GROWTH_LIMIT = MESSAGE_STEPS.length - 1 + MOVE_PHASE_CLICKS
const HEARTS = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 11) % 92)}%`,
  duration: `${9 + (index % 5) * 1.6}s`,
  delay: `${(index % 6) * 1.1}s`,
  size: `${16 + (index % 4) * 8}px`,
  opacity: 0.28 + (index % 3) * 0.12,
}))
const TAUNT_MESSAGES = [
  "I'm here..",
  "Can't catch me",
  'Too slow, pookie',
  'Missed me again',
  'Nope, over here',
  'You almost had me',
  'That was close',
  'Still not catching me',
  'I can do this all day',
  'I saw that coming',
  'Almost impressive',
  'Boop, gone again',
  'Too quick for you',
  'You are determined huh',
  'Still dodging',
  'Next trick: vanish',
  'This is now a chase scene',
  'You are locked in huh',
  'Close. Not close enough',
  'A for effort',
  'I felt that one',
  'Not today',
  'Still faster',
  'Nice reflexes. Mine are better',
  'The script says I dodge here',
  'That click had heart',
  'Cute try though',
  'Oh, we are serious now',
  'You are one click behind',
  'Good attempt, no notes',
  'Here we go again',
]
const YES_TEASE_MESSAGES = [
  'Try saying no first... I bet you want to know what happens 😏',
  'Go on, hit no... just once 👀',
  "You're missing out 😈",
  'Click no, I dare you 😏',
]
const MOBILE_MOVE_FACTORS = [
  { x: 0.86, y: 0.12 },
  { x: 0.08, y: 0.2 },
  { x: 0.84, y: 0.34 },
  { x: 0.12, y: 0.4 },
  { x: 0.62, y: 0.18 },
  { x: 0.22, y: 0.5 },
]
const GIF_SIZE_CONFIG = {
  1: {
    desktopWidth: '290px',
    desktopHeight: '200px',
    mobileWidth: '280px',
    mobileHeight: '190px',
  },
  2: {
    desktopWidth: '210px',
    desktopHeight: '190px',
    mobileWidth: '200px',
    mobileHeight: '180px',
  },
  3: {
    desktopWidth: '300px',
    desktopHeight: '200px',
    mobileWidth: '290px',
    mobileHeight: '190px',
  },
  4: {
    desktopWidth: '300px',
    desktopHeight: '200px',
    mobileWidth: '290px',
    mobileHeight: '190px',
  },
  5: {
    desktopWidth: '270px',
    desktopHeight: '170px',
    mobileWidth: '260px',
    mobileHeight: '160px',
  },
  6: {
    desktopWidth: '280px',
    desktopHeight: '180px',
    mobileWidth: '270px',
    mobileHeight: '170px',
  },
  7: {
    desktopWidth: '300px',
    desktopHeight: '200px',
    mobileWidth: '290px',
    mobileHeight: '190px',
  },
  8: {
    desktopWidth: '210px',
    desktopHeight: '190px',
    mobileWidth: '200px',
    mobileHeight: '180px',
  },
  9: {
    desktopWidth: '310px',
    desktopHeight: '210px',
    mobileWidth: '290px',
    mobileHeight: '190px',
  },
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const PLAY_AREA_PADDING = 12

const CONFETTI = Array.from({ length: 140 }, (_, index) => ({
  id: index,
  delay: `${(index % 8) * 0.08}s`,
  duration: '3.6s',
  color: ['#ff5fa2', '#ffd166', '#44b765', '#7cc6ff', '#d94c5f'][index % 5],
  rotate: `${(index % 2 === 0 ? 1 : -1) * (12 + (index % 4) * 10)}deg`,
  x: ((index * 37) % 100) / 100,
  y: ((index * 53) % 100) / 100,
}))

const getPositionFromFactor = (bounds, buttonSize, factor) => {
  const maxX = Math.max(bounds.width - buttonSize.width - PLAY_AREA_PADDING * 2, 0)
  const maxY = Math.max(bounds.height - buttonSize.height - PLAY_AREA_PADDING * 2, 0)

  return {
    x: PLAY_AREA_PADDING + clamp(Math.round(maxX * factor.x), 0, maxX),
    y: PLAY_AREA_PADDING + clamp(Math.round(maxY * factor.y), 0, maxY),
  }
}

const getRandomPosition = (bounds, buttonSize, currentPosition, pointerPosition) => {
  const maxX = Math.max(bounds.width - buttonSize.width - PLAY_AREA_PADDING * 2, 0)
  const maxY = Math.max(bounds.height - buttonSize.height - PLAY_AREA_PADDING * 2, 0)

  let bestPosition = {
    x: PLAY_AREA_PADDING + Math.round(Math.random() * maxX),
    y: PLAY_AREA_PADDING + Math.round(Math.random() * maxY),
  }

  for (let index = 0; index < 10; index += 1) {
    const candidate = {
      x: PLAY_AREA_PADDING + Math.round(Math.random() * maxX),
      y: PLAY_AREA_PADDING + Math.round(Math.random() * maxY),
    }

    const farFromCurrent = !currentPosition || Math.hypot(candidate.x - currentPosition.x, candidate.y - currentPosition.y) > 110
    const farFromPointer =
      !pointerPosition ||
      Math.hypot(
        candidate.x + buttonSize.width / 2 - pointerPosition.x,
        candidate.y + buttonSize.height / 2 - pointerPosition.y,
      ) > 170

    if (farFromCurrent && farFromPointer) {
      return candidate
    }

    bestPosition = candidate
  }

  return bestPosition
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640)
  const [noClicks, setNoClicks] = useState(0)
  const [moveClicks, setMoveClicks] = useState(0)
  const [gifStep, setGifStep] = useState(0)
  const [yesAccepted, setYesAccepted] = useState(false)
  const [yesHover, setYesHover] = useState(false)
  const [yesClickBounce, setYesClickBounce] = useState(false)
  const [yesTeaseIndex, setYesTeaseIndex] = useState(0)
  const [noPosition, setNoPosition] = useState(null)
  const [noMotionProfile, setNoMotionProfile] = useState({
    leftMs: 240,
    topMs: 240,
    transformMs: 180,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  })
  const [showShake, setShowShake] = useState(false)
  const [tauntMessage, setTauntMessage] = useState('')
  const [tauntVisible, setTauntVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const stageRef = useRef(null)
  const noButtonRef = useRef(null)
  const audioRef = useRef(null)
  const tauntIndexRef = useRef(0)
  const tauntShowTimeoutRef = useRef(null)
  const tauntHideTimeoutRef = useRef(null)
  const lastPointerRef = useRef(null)
  const pointerSampleRef = useRef({
    x: 0,
    y: 0,
    time: 0,
    speed: 0,
  })
  const dodgeCooldownRef = useRef(false)
  const yesBounceTimeoutRef = useRef(null)
  const hasStartedMusicRef = useRef(false)

  const messageIndex = Math.min(noClicks, MESSAGE_STEPS.length - 1)
  const successUnlocked = noClicks >= 4
  const movePhaseActive = noClicks >= MESSAGE_STEPS.length - 1
  const chaoticStageActive = movePhaseActive && !isMobile
  const evasivePhaseActive = isMobile ? false : moveClicks >= MOVE_PHASE_CLICKS
  const noLabel = !isMobile && evasivePhaseActive ? 'Catch me 😌' : MESSAGE_STEPS[messageIndex]
  const mainGifNumber = Math.min(gifStep, 7) + 1
  const mainGifSrc = `/Gifs/${mainGifNumber}.gif`
  const successGifSrc = '/Gifs/9.gif'
  const mainGifSize = GIF_SIZE_CONFIG[mainGifNumber]
  const successGifSize = GIF_SIZE_CONFIG[9]
  const growthClicks = Math.min(noClicks, GROWTH_LIMIT)
  const desktopFastGrowthClicks = Math.min(growthClicks, 5)
  const desktopSlowGrowthClicks = Math.max(growthClicks - 5, 0)
  const baseYesScale = isMobile
    ? Math.min(2.5, 1.09 * Math.pow(1.15, growthClicks))
    : Math.min(5.0, 1.17 * Math.pow(1.28, desktopFastGrowthClicks) * Math.pow(1.08, desktopSlowGrowthClicks))
  const yesScale = isMobile && noClicks >= 7 ? baseYesScale * 1.12 : baseYesScale
  const yesHoverScale = yesHover ? 1.04 : 1
  const noScale = isMobile ? 1 - Math.min(noClicks, 4) * 0.08 : 1 - Math.min(noClicks, 5) * 0.04
  const centerProgress = Math.min(noClicks / (MESSAGE_STEPS.length - 1), 1)
  const yesOffset = isMobile ? 0 : 86 * centerProgress
  const yesVerticalOffset = movePhaseActive
    ? 0
    : Math.round(
        centerProgress * (isMobile ? 4 : 0) +
          (isMobile ? Math.max(0, yesScale - 1) * 8 : 0) +
          (isMobile && noClicks >= 6 ? Math.max(0, noClicks - 5) * 4 : 0),
      )
  const promptLift = yesAccepted ? 0 : Math.round(centerProgress * (isMobile ? 58 : 118))
  const mobileYesStackGap =
    isMobile && !movePhaseActive && noClicks > 0
      ? Math.round(
          10 +
            Math.max(0, yesScale - 1) * 54 +
            (noClicks >= 5 ? 5 : 0) +
            (noClicks >= 6 ? 7 : 0),
        )
      : 0
  const noInlineShift =
    isMobile
      ? 0
      : noClicks < MESSAGE_STEPS.length - 1
        ? Math.round(
            22 +
              centerProgress * 60 +
              Math.max(0, yesScale - 1) * 42 +
              (1 - noScale) * 20 +
              Math.max(0, noClicks - 2) * 6,
          )
        : 0
  const noVerticalOffset = 0
  const yesPaddingX = Math.round(38 - centerProgress * 12)
  const yesPaddingY = Math.round(17 + centerProgress * 7)
  const yesRadius = Math.round(8 + centerProgress * 7)
  const layoutLift = noClicks >= 3 ? Math.min(56, 18 + (noClicks - 3) * 10) : 0
  const teaseMessage =
    noClicks === 0 && yesTeaseIndex >= YES_TEASE_MESSAGES.length - 1
      ? 'Click no, I dare you 😏'
      : noClicks > 0 && yesTeaseIndex >= YES_TEASE_MESSAGES.length - 1
        ? "Keep clicking no, you're missing out 😈"
        : YES_TEASE_MESSAGES[Math.min(yesTeaseIndex, YES_TEASE_MESSAGES.length - 1)]

  const showTeaseMessage = !yesAccepted && !successUnlocked && yesTeaseIndex > 0
  const teaseMessageToShow =
    noClicks === 0
      ? yesTeaseIndex <= 1
        ? YES_TEASE_MESSAGES[0]
        : yesTeaseIndex === 2
          ? YES_TEASE_MESSAGES[1]
          : yesTeaseIndex === 3
            ? YES_TEASE_MESSAGES[2]
            : 'Click no, I dare you 😏'
      : 'Come on.. hit no a few more times 👀'

  const mobileQuestionTitle = (
    <>
      <span className="question-title-text">
        Will you be
        <br />
        my Valentine?
      </span>
      <span className="question-title-emoji">{'\u{1F495}'}</span>
    </>
  )

  const triggerShake = (nextMoveCount) => {
    if (nextMoveCount !== 2 && nextMoveCount !== 4) {
      return
    }

    setShowShake(false)
    window.setTimeout(() => {
      setShowShake(true)
      window.setTimeout(() => {
        setShowShake(false)
      }, 500)
    }, 60)
  }

  const clearTauntTimers = () => {
    if (tauntShowTimeoutRef.current) {
      window.clearTimeout(tauntShowTimeoutRef.current)
      tauntShowTimeoutRef.current = null
    }

    if (tauntHideTimeoutRef.current) {
      window.clearTimeout(tauntHideTimeoutRef.current)
      tauntHideTimeoutRef.current = null
    }
  }

  const triggerYesBounce = () => {
    if (yesBounceTimeoutRef.current) {
      window.clearTimeout(yesBounceTimeoutRef.current)
    }

    setYesClickBounce(false)
    window.setTimeout(() => {
      setYesClickBounce(true)
      yesBounceTimeoutRef.current = window.setTimeout(() => {
        setYesClickBounce(false)
        yesBounceTimeoutRef.current = null
      }, 210)
    }, 0)
  }

  const showNextTaunt = () => {
    const nextMessage = TAUNT_MESSAGES[tauntIndexRef.current % TAUNT_MESSAGES.length]
    tauntIndexRef.current += 1

    clearTauntTimers()
    setTauntVisible(false)
    setTauntMessage(nextMessage)

    tauntShowTimeoutRef.current = window.setTimeout(() => {
      setTauntVisible(true)
      tauntHideTimeoutRef.current = window.setTimeout(() => {
        setTauntVisible(false)
      }, 2000)
    }, 700)
  }

  const startMusicIfNeeded = () => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = 0.72
    audio.loop = true

    if (!hasStartedMusicRef.current) {
      hasStartedMusicRef.current = true
    }

    if (!isMuted) {
      void audio.play().catch(() => {})
    }
  }

  const toggleMusic = () => {
    const audio = audioRef.current

    if (!audio) {
      setIsMuted((current) => !current)
      return
    }

    audio.volume = 0.72
    audio.loop = true

    if (!hasStartedMusicRef.current) {
      hasStartedMusicRef.current = true
    }

    if (isMuted) {
      setIsMuted(false)
      audio.muted = false

      void audio.play().catch(() => {})

      return
    }

    setIsMuted(true)
    audio.muted = true
  }

  const relocateNoButton = (mode = 'chaotic', forcedMoveIndex = null, urgency = 'normal') => {
    if (!stageRef.current || !noButtonRef.current) {
      return
    }

    const stageBounds = stageRef.current.getBoundingClientRect()
    const buttonBounds = noButtonRef.current.getBoundingClientRect()
    const bounds = isMobile
      ? {
          width: Math.max(window.innerWidth - PLAY_AREA_PADDING, 0),
          height: Math.max(window.innerHeight - PLAY_AREA_PADDING, 0),
        }
      : {
          width: Math.max(Math.min(stageBounds.width, window.innerWidth - stageBounds.left) - PLAY_AREA_PADDING, 0),
          height: Math.max(
            Math.min(stageBounds.height, window.innerHeight - stageBounds.top) - PLAY_AREA_PADDING,
            0,
          ),
        }
    const size = {
      width: buttonBounds.width,
      height: buttonBounds.height,
    }
    const mobileViewportOffset = isMobile
      ? {
          x: PLAY_AREA_PADDING / 2 - stageBounds.left,
          y: PLAY_AREA_PADDING / 2 - stageBounds.top,
        }
      : null

    const pointerPosition =
      mode === 'evasive'
        ? lastPointerRef.current ?? {
            x: bounds.width / 2,
            y: bounds.height / 2,
          }
        : null

    if (mode === 'evasive') {
      clearTauntTimers()
      setTauntVisible(false)

      if (urgency === 'panic') {
        setNoMotionProfile({
          leftMs: 136,
          topMs: 136,
          transformMs: 160,
          easing: 'cubic-bezier(0.18, 0.9, 0.22, 1)',
        })
      } else if (urgency === 'tease') {
        const glideMs = 290 + Math.round(Math.random() * 90)
        setNoMotionProfile({
          leftMs: glideMs,
          topMs: glideMs,
          transformMs: 220 + Math.round(Math.random() * 70),
          easing: 'cubic-bezier(0.2, 0.84, 0.24, 1)',
        })
      } else {
        const cruiseMs = 220 + Math.round(Math.random() * 85)
        setNoMotionProfile({
          leftMs: cruiseMs,
          topMs: cruiseMs,
          transformMs: 190 + Math.round(Math.random() * 55),
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        })
      }
    } else {
      setNoMotionProfile({
        leftMs: 240,
        topMs: 240,
        transformMs: 180,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      })
    }

    const moveIndex = forcedMoveIndex ?? moveClicks
    const nextPosition =
      !isMobile && mode === 'chaotic' && moveIndex === 0
        ? getPositionFromFactor(bounds, size, { x: 0.78, y: 0.34 })
        : isMobile && moveIndex < MOBILE_MOVE_FACTORS.length
        ? getPositionFromFactor(bounds, size, MOBILE_MOVE_FACTORS[moveIndex])
        : getRandomPosition(bounds, size, noPosition, pointerPosition)

    setNoPosition(
      isMobile && mobileViewportOffset
        ? {
            x: nextPosition.x + mobileViewportOffset.x,
            y: nextPosition.y + mobileViewportOffset.y,
          }
        : nextPosition,
    )

    if (mode === 'evasive') {
      showNextTaunt()
      return
    }

    setTauntVisible(false)
  }

  useEffect(
    () => () => {
      clearTauntTimers()
      if (yesBounceTimeoutRef.current) {
        window.clearTimeout(yesBounceTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.muted = isMuted
  }, [isMuted])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleNoClick = () => {
    if (yesAccepted || evasivePhaseActive) {
      return
    }

    startMusicIfNeeded()

    const nextNoClicks = noClicks + 1
    const entersMovePhase = nextNoClicks >= MESSAGE_STEPS.length - 1

    setGifStep((current) => Math.min(current + 1, 7))
    setYesTeaseIndex(0)
    setNoClicks((current) => current + 1)

    if (isMobile || movePhaseActive || entersMovePhase) {
      const nextMoveCount = moveClicks + 1
      setMoveClicks(nextMoveCount)
      relocateNoButton('chaotic', nextMoveCount - 1)

      if (!isMobile) {
        triggerShake(nextMoveCount)
      }
    }
  }

  const handleYesClick = () => {
    triggerYesBounce()
    startMusicIfNeeded()

    if (!successUnlocked) {
      setYesTeaseIndex((current) => current + 1)
      return
    }

    setYesAccepted(true)
  }

  const handleStageMouseMove = (event) => {
    if (isMobile || !evasivePhaseActive || !stageRef.current || !noButtonRef.current) {
      return
    }

    const stageBounds = stageRef.current.getBoundingClientRect()
    lastPointerRef.current = {
      x: clamp(event.clientX - stageBounds.left, 0, stageBounds.width),
      y: clamp(event.clientY - stageBounds.top, 0, stageBounds.height),
    }
    const now = performance.now()
    const previousSample = pointerSampleRef.current
    const deltaTime = Math.max(now - previousSample.time, 16)
    const pointerSpeed =
      previousSample.time === 0
        ? 0
        : Math.hypot(
            lastPointerRef.current.x - previousSample.x,
            lastPointerRef.current.y - previousSample.y,
          ) / deltaTime

    pointerSampleRef.current = {
      x: lastPointerRef.current.x,
      y: lastPointerRef.current.y,
      time: now,
      speed: pointerSpeed,
    }

    if (dodgeCooldownRef.current) {
      return
    }

    const buttonBounds = noButtonRef.current.getBoundingClientRect()
    const buttonCenterX = buttonBounds.left + buttonBounds.width / 2
    const buttonCenterY = buttonBounds.top + buttonBounds.height / 2
    const distance = Math.hypot(event.clientX - buttonCenterX, event.clientY - buttonCenterY)

    const dodgeThreshold = pointerSpeed < 0.18 ? 54 : pointerSpeed < 0.42 ? 76 : 112

    if (distance > dodgeThreshold) {
      return
    }

    dodgeCooldownRef.current = true
    const dodgeUrgency = distance < 34 || pointerSpeed > 0.95 ? 'panic' : pointerSpeed < 0.22 ? 'tease' : 'normal'
    const cooldownMs =
      dodgeUrgency === 'panic' ? 120 : dodgeUrgency === 'tease' ? 230 + Math.round(Math.random() * 40) : 185

    relocateNoButton('evasive', null, dodgeUrgency)
    window.setTimeout(() => {
      dodgeCooldownRef.current = false
    }, cooldownMs)
  }

  const noButtonStyle = noPosition
    ? {
        left: `${noPosition.x}px`,
        top: `${noPosition.y}px`,
      }
    : undefined

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  if (isLoading) {
    return (
      <>
        <audio
          ref={audioRef}
          className="background-audio"
          src="/Music/music_beabadoobee - Glue Song (Lyrics).mp3"
          preload="auto"
          loop
          playsInline
        />
        <button
          type="button"
          className="sound-toggle"
          aria-label={isMuted ? 'Unmute music' : 'Mute music'}
          aria-pressed={isMuted}
          onClick={toggleMusic}
        >
          <span className="sound-toggle-icon" aria-hidden="true">
            {isMuted ? '🔇' : '🔊'}
          </span>
        </button>
        <main className="loading-screen">
          <div className="hearts-layer" aria-hidden="true">
            {HEARTS.map((heart) => (
              <span
                key={heart.id}
                className="heart"
                style={{
                  left: heart.left,
                  animationDuration: heart.duration,
                  animationDelay: heart.delay,
                  fontSize: heart.size,
                  opacity: heart.opacity,
                }}
              >
                {'\u2665'}
              </span>
            ))}
          </div>
          <div className="loading-glow loading-glow-left" aria-hidden="true" />
          <div className="loading-glow loading-glow-right" aria-hidden="true" />
          <div className="loading-scene" aria-label="Valentine letter opening">
            <div className="letter-loader" aria-hidden="true">
              <div className="letter-note">
                <div className="letter-note-inner">
                  <span className="letter-note-heart">{'\u2665'}</span>
                  <span className="letter-note-text">For you</span>
                </div>
              </div>
              <div className="letter-flap" />
              <div className="letter-body" />
              <div className="letter-fold letter-fold-left" />
              <div className="letter-fold letter-fold-right" />
              <div className="letter-seal">{'\u2665'}</div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <audio
        ref={audioRef}
        className="background-audio"
        src="/Music/music_beabadoobee - Glue Song (Lyrics).mp3"
        preload="auto"
        loop
        playsInline
      />
      <button
        type="button"
        className="sound-toggle"
        aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        aria-pressed={isMuted}
        onClick={toggleMusic}
      >
        <span className="sound-toggle-icon" aria-hidden="true">
          {isMuted ? '🔇' : '🔊'}
        </span>
      </button>
      <main className="app-shell">
        <div className="hearts-layer" aria-hidden="true">
          {HEARTS.map((heart) => (
            <span
              key={heart.id}
              className="heart"
              style={{
                left: heart.left,
                animationDuration: heart.duration,
                animationDelay: heart.delay,
                fontSize: heart.size,
                opacity: heart.opacity,
              }}
            >
              {'\u2665'}
            </span>
          ))}
        </div>

          <section className="content">
          <h1
            className={yesAccepted ? 'is-success' : undefined}
            style={{
              position: 'relative',
              top: `-${promptLift}px`,
            }}
          >
          {yesAccepted ? (
            isMobile ? (
              <>
                <span className="yes-title-text">
                  Knew you
                  <br />
                  would say yes!
                </span>
                <span className="yes-title-emoji">🎉</span>
              </>
            ) : (
              'Knew you would say yes! 🎉'
            )
          ) : isMobile ? (
            mobileQuestionTitle
          ) : (
            'Will you be my Valentine? 💕'
          )}
          </h1>

        {yesAccepted ? (
          <div className="celebration">
            <div className="confetti-layer" aria-hidden="true">
              {CONFETTI.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    background: piece.color,
                    '--confetti-rotate': piece.rotate,
                    '--confetti-x': piece.x,
                    '--confetti-y': piece.y,
                  }}
                />
              ))}
            </div>
            <div className="gif-slot gif-slot-success">
              <img
                className="reaction-gif reaction-gif-success"
                src={successGifSrc}
                alt="Celebration gif"
                style={{
                  '--gif-desktop-width': successGifSize.desktopWidth,
                  '--gif-desktop-height': successGifSize.desktopHeight,
                  '--gif-mobile-width': successGifSize.mobileWidth,
                  '--gif-mobile-height': successGifSize.mobileHeight,
                }}
              />
            </div>
            <p className="celebration-kicker">
              {isMobile ? (
                <>
                  You just made me the happiest
                  <br />
                  person! 💕
                </>
              ) : (
                'You just made me the happiest person! 💕'
              )}
            </p>
          </div>
        ) : (
          <>
            <div
                className="gif-slot gif-slot-main"
                style={{
                  transform: `translateY(-${promptLift}px)`,
                  marginTop:
                    !isMobile && mainGifNumber === 3
                      ? '-12px'
                      : !isMobile && mainGifNumber === 5
                        ? '46px'
                      : !isMobile && mainGifNumber === 7
                        ? '-6px'
                      : isMobile && mainGifNumber === 3
                      ? '-30px'
                      : isMobile && mainGifNumber === 5
                        ? '24px'
                      : isMobile && mainGifNumber === 7
                        ? '-18px'
                      : isMobile && mainGifNumber === 8
                        ? '-10px'
                        : undefined,
                  marginBottom:
                    !isMobile && mainGifNumber === 2
                      ? '5px'
                      : !isMobile && mainGifNumber === 3
                        ? '-4px'
                      : !isMobile && mainGifNumber === 4
                        ? '5px'
                      : !isMobile && mainGifNumber === 5
                        ? '24px'
                      : !isMobile && mainGifNumber === 6
                        ? '28px'
                      : !isMobile && mainGifNumber === 7
                        ? '12px'
                      : !isMobile && mainGifNumber === 8
                        ? '2px'
                      : isMobile && mainGifNumber === 3
                      ? '2px'
                      : isMobile && mainGifNumber === 4
                      ? '8px'
                      : isMobile && mainGifNumber === 5
                      ? '8px'
                      : 
                    isMobile && mainGifNumber === 6
                      ? '-14px'
                      : isMobile && mainGifNumber === 7
                        ? '-38px'
                      : mainGifNumber === 8
                        ? (isMobile ? '-46px' : undefined)
                        : undefined,
                }}
              >
              <img
                key={mainGifSrc}
                className="reaction-gif reaction-gif-main"
                src={mainGifSrc}
                alt="Valentine reaction gif"
                style={{
                  '--gif-desktop-width': mainGifSize.desktopWidth,
                  '--gif-desktop-height': mainGifSize.desktopHeight,
                  '--gif-mobile-width': mainGifSize.mobileWidth,
                  '--gif-mobile-height': mainGifSize.mobileHeight,
                }}
              />
            </div>
            <div
              ref={stageRef}
              className={`button-stage ${chaoticStageActive ? 'is-chaotic' : ''} ${
                isMobile && noClicks === 0 && !movePhaseActive ? 'is-mobile-initial' : ''
              } ${
                isMobile && noClicks > 0 && !movePhaseActive ? 'is-mobile-stacked' : ''
              } ${
                isMobile && noClicks === 4 && !movePhaseActive ? 'is-mobile-stacked-four' : ''
              } ${
                isMobile && noClicks >= 5 && !movePhaseActive ? 'is-mobile-stacked-late' : ''
              } ${
                isMobile && noClicks >= 6 && !movePhaseActive ? 'is-mobile-stacked-later' : ''
              } ${
                isMobile && noClicks === 0 && showTeaseMessage ? 'is-mobile-inline-tease' : ''
              } ${
                !isMobile && noClicks >= 2 && showTeaseMessage ? 'is-desktop-late-tease' : ''
              } ${
                evasivePhaseActive ? 'is-evasive' : ''
              }`}
              onMouseMove={handleStageMouseMove}
            >
              <button
                type="button"
                className={`choice-button yes-button ${
                  chaoticStageActive && moveClicks > 1 ? 'has-smooth-chaotic-hover' : ''
                }`}
                style={{
                  '--yes-padding-x': `${yesPaddingX}px`,
                  '--yes-padding-y': `${yesPaddingY}px`,
                  '--yes-radius': `${yesRadius}px`,
                  '--yes-stack-gap': `${mobileYesStackGap}px`,
                  '--yes-bounce-scale': yesClickBounce ? 1.085 : 1,
                  transform: chaoticStageActive
                    ? `translate(-50%, -50%) scale(${yesScale * yesHoverScale * (yesClickBounce ? 1.085 : 1)})`
                    : `translate(${yesOffset}px, ${yesVerticalOffset}px) scale(${yesScale * yesHoverScale * (yesClickBounce ? 1.085 : 1)})`,
                }}
                onMouseEnter={() => setYesHover(true)}
                onMouseLeave={() => setYesHover(false)}
                onClick={handleYesClick}
              >
                Yes
              </button>

              <button
                ref={noButtonRef}
                type="button"
                className={`choice-button no-button ${
                  movePhaseActive && noPosition ? 'is-floating' : ''
                } ${evasivePhaseActive ? 'is-untouchable' : ''} ${
                  showShake ? 'is-shaking' : ''
                }`}
                style={{
                  ...noButtonStyle,
                  '--no-scale': noScale,
                  '--no-shift': `${noInlineShift}px`,
                  '--no-drop': `${noVerticalOffset}px`,
                  '--no-left-ms': `${noMotionProfile.leftMs}ms`,
                  '--no-top-ms': `${noMotionProfile.topMs}ms`,
                  '--no-transform-ms': `${noMotionProfile.transformMs}ms`,
                  '--no-easing': noMotionProfile.easing,
                }}
                onClick={handleNoClick}
                onMouseEnter={evasivePhaseActive ? () => relocateNoButton('evasive', null, 'panic') : undefined}
              >
                {noLabel}
              </button>

              {!isMobile && evasivePhaseActive && tauntMessage ? (
                <div
                  className={`taunt-bubble ${tauntVisible ? 'is-visible' : ''}`}
                  style={noButtonStyle}
                >
                  {tauntMessage}
                </div>
              ) : null}

              {showTeaseMessage ? <p className="tease-text">{teaseMessageToShow}</p> : null}
            </div>
          </>
        )}
        </section>
      </main>
    </>
  )
}

export default App
