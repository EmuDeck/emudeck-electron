!include WinMessages.nsh

!define EMUDECK_GIT_URL "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/PortableGit-2.51.0-64-bit.7z.exe"
!define EMUDECK_GIT_DIR "$LOCALAPPDATA\Programs\Git"
!define EMUDECK_PYTHON_URL "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe"

!macro EmuDeckLog text
  FileWrite $R9 "${text}$\r$\n"
  DetailPrint "${text}"
!macroend

; Python path #1
!macro EmuDeckFindPythonIn root
  ${If} $R1 == ""
    FindFirst $R2 $R3 "${root}\Python3*"
    ${DoWhile} $R3 != ""
      ${If} ${FileExists} "${root}\$R3\python.exe"
        StrCpy $R1 "${root}\$R3\python.exe"
        ${Break}
      ${EndIf}
      FindNext $R2 $R3
    ${Loop}
    FindClose $R2
  ${EndIf}
!macroend

; Python path #2
!macro EmuDeckFindPythonInRegistry hive
  ${If} $R1 == ""
    StrCpy $R2 0
    ${Do}
      EnumRegKey $R3 ${hive} "Software\Python\PythonCore" $R2
      ${If} $R3 == ""
        ${Break}
      ${EndIf}
      ReadRegStr $R0 ${hive} "Software\Python\PythonCore\$R3\InstallPath" "ExecutablePath"
      ${If} $R0 != ""
      ${AndIf} ${FileExists} "$R0"
        StrCpy $R1 "$R0"
        ${Break}
      ${EndIf}
      IntOp $R2 $R2 + 1
    ${Loop}
  ${EndIf}
!macroend

; User PATH for git
!macro EmuDeckAddToUserPath dir
  ClearErrors
  ReadRegStr $R0 HKCU "Environment" "Path"
  ${If} ${Errors}
    !insertmacro EmuDeckLog "User PATH not readable, not adding ${dir}"
  ${Else}
    ; Case-insensitive substring search of dir in the PATH
    StrLen $R2 "${dir}"
    StrCpy $R3 0
    StrCpy $R4 "0"
    ${Do}
      StrCpy $R5 $R0 $R2 $R3
      ${If} $R5 == ""
        ${Break}
      ${EndIf}
      ${If} $R5 == "${dir}"
        StrCpy $R4 "1"
        ${Break}
      ${EndIf}
      IntOp $R3 $R3 + 1
    ${Loop}
    ${If} $R4 == "1"
      !insertmacro EmuDeckLog "${dir} already in user PATH"
    ${Else}
      ${If} $R0 == ""
        StrCpy $R0 "${dir}"
      ${Else}
        StrCpy $R0 "$R0;${dir}"
      ${EndIf}
      WriteRegExpandStr HKCU "Environment" "Path" "$R0"
      SendMessage ${HWND_BROADCAST} ${WM_SETTINGCHANGE} 0 "STR:Environment" /TIMEOUT=5000
      !insertmacro EmuDeckLog "Added ${dir} to user PATH"
    ${EndIf}
  ${EndIf}
!macroend

!macro customInstall
  Push $R0
  Push $R1
  Push $R2
  Push $R3
  Push $R4
  Push $R5
  Push $R9

  CreateDirectory "$APPDATA\EmuDeck\logs"
  FileOpen $R9 "$APPDATA\EmuDeck\logs\installer.log" a
  FileSeek $R9 0 END

  ;Git
  StrCpy $R1 ""
  ${If} ${FileExists} "${EMUDECK_GIT_DIR}\cmd\git.exe"
    StrCpy $R1 "${EMUDECK_GIT_DIR}\cmd\git.exe"
  ${ElseIf} ${FileExists} "$PROGRAMFILES64\Git\cmd\git.exe"
    StrCpy $R1 "$PROGRAMFILES64\Git\cmd\git.exe"
  ${Else}
    SearchPath $R1 "git.exe"
  ${EndIf}

  ${If} $R1 != ""
    !insertmacro EmuDeckLog "Git found: $R1"
    ${If} $R1 == "${EMUDECK_GIT_DIR}\cmd\git.exe"
      !insertmacro EmuDeckAddToUserPath "${EMUDECK_GIT_DIR}\cmd"
    ${EndIf}
  ${Else}
    !insertmacro EmuDeckLog "Git not found, downloading..."
    inetc::get /CAPTION "EmuDeck" /BANNER "Downloading Git..." "${EMUDECK_GIT_URL}" "$TEMP\emudeck_git_install.exe" /END
    Pop $R0
    ${If} $R0 == "OK"
      !insertmacro EmuDeckLog "Extracting PortableGit to ${EMUDECK_GIT_DIR}..."
      CreateDirectory "${EMUDECK_GIT_DIR}"
      ExecWait '"$TEMP\emudeck_git_install.exe" -y -o"${EMUDECK_GIT_DIR}"' $R0
      !insertmacro EmuDeckLog "PortableGit extract exit code: $R0"
      ${If} ${FileExists} "${EMUDECK_GIT_DIR}\cmd\git.exe"
        !insertmacro EmuDeckAddToUserPath "${EMUDECK_GIT_DIR}\cmd"
      ${EndIf}
    ${Else}
      !insertmacro EmuDeckLog "Git download failed: $R0"
    ${EndIf}
    Delete "$TEMP\emudeck_git_install.exe"
  ${EndIf}

  ;Python
  StrCpy $R1 ""
  !insertmacro EmuDeckFindPythonIn "$LOCALAPPDATA\Programs\Python"
  !insertmacro EmuDeckFindPythonIn "$PROGRAMFILES64"
  !insertmacro EmuDeckFindPythonInRegistry HKCU
  SetRegView 64
  !insertmacro EmuDeckFindPythonInRegistry HKLM
  SetRegView lastused

  ${If} $R1 != ""
    !insertmacro EmuDeckLog "Python found: $R1"
  ${Else}
    !insertmacro EmuDeckLog "Python not found, downloading..."
    inetc::get /CAPTION "EmuDeck" /BANNER "Downloading Python..." "${EMUDECK_PYTHON_URL}" "$TEMP\emudeck_python_install.exe" /END
    Pop $R0
    ${If} $R0 == "OK"
      !insertmacro EmuDeckLog "Installing Python..."
      ExecWait '"$TEMP\emudeck_python_install.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0' $R0
      !insertmacro EmuDeckLog "Python installer exit code: $R0"
    ${Else}
      !insertmacro EmuDeckLog "Python download failed: $R0"
    ${EndIf}
    Delete "$TEMP\emudeck_python_install.exe"
  ${EndIf}

  FileClose $R9

  Pop $R9
  Pop $R5
  Pop $R4
  Pop $R3
  Pop $R2
  Pop $R1
  Pop $R0
!macroend
